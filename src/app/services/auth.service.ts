import { Injectable } from '@angular/core';
import {
  Auth, // Used to get the current user and subscribe to the auth state.
  createUserWithEmailAndPassword, // Used to create a user in Firebase auth.
  sendPasswordResetEmail, // Used to send a password reset email.
  signInWithEmailAndPassword, // Used to sign in a user with email and password.
  signOut, // Used to sign out a user.
  User, // Used to get the current user and subscribe to the auth state.
} from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore'; // Used to interact with Firestore databse. We store user info in Firestore.
import { BehaviorSubject } from 'rxjs'; // Add this import
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Inject Firestore service. We need it to create a user profile in Firestore.
  constructor(private auth: Auth, private firestore: Firestore, private afAuth: AngularFireAuth) {
    // Subscribe to the authentication state to keep track of the current user
    this.auth.onAuthStateChanged((user) => {
      this.currentUserSubject.next(user);
    });
  }
  
  getCurrentUserEmail(): string | null {
    const user = this.currentUserSubject.value;
    console.log('Logged in as: ', user?.email);
    return user?.email ?? null;
  }

  async getCurrentUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
    console.log('Logged in as GET CURRENT USER ID: ', user?.uid);
  }

  

  // Sign up with email/password. Creates user in Firebase auth and adds user info to Firestore database
  async register({ email, password }: { email: string; password: string }) {
    try {
      const credentials = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // In case the user is created successfully, create a document in `users` collection
      const ref = doc(this.firestore, `users/${credentials.user.uid}`);
      setDoc(ref, { email }); // Set the document. Data is written to the database.
      return credentials;
    } catch (e) {
      console.log('Error in register: ', e);
      return null;
    }
  }

  // Sign in with email/password. We pass the email and password as parameters.
  async login({ email, password }: { email: string; password: string }) {
    try {
      // Sign in user. If successful, the user object is returned. Otherwise, null is returned.
      const credentials = await signInWithEmailAndPassword(
        this.auth, // <-- Injected AngularFireAuth service
        email, // <-- Email passed as parameter
        password // <-- Password passed as parameter
      );
      return credentials; // <-- Return the user object
    } catch (e) {
      console.log('Error in register: ', e);
      return null;
    }
  }

  resetPw(email: string) {
    // Pass in athentication private and email address
    return sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    return signOut(this.auth);
  }
}
