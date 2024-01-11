import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage  {

  constructor(
    private fb: FormBuilder, // <-- Inject the FormBuilder to handle form validation in reactive forms
    private loadingController: LoadingController, // <-- Inject the LoadingController to handle loading state by displaying a spinner
    private alertController: AlertController, // <-- Inject the AlertController to handle errors and display alert messages
    private authService: AuthService, // <-- Inject the AuthService to handle login and registration
    private router: Router // <-- Inject the Router to redirect after successful login
  ) {}
  
    // Define the form group with the FormBuilder service. The form group is a collection of form controls.
  // The form controls are the individual fields of the form. The form group is used to track the value and
  // validity state of the form controls. credentials is the name of the form group.
    credentials = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  }); 

 

 // Easy access for form fields. This is used in the template to display validation errors.
  get email() {
    return this.credentials.controls.email;
  }

  // Easy access for form fields. This is used in the template to display validation errors.
  get password() {
    return this.credentials.controls.password;
  }

  // Register a new user with the AuthService. If successful, redirect to the home page.
  async register() {
    // Create a loading overlay. This will be displayed while the request is running.
    const loading = await this.loadingController.create();
    await loading.present(); // <-- Show loading spinner
    // Call the register method from the AuthService. This returns a user object if successful, or null if unsuccessful.
    const user = await this.authService.register(
      this.credentials.getRawValue() // <-- Pass the raw value of the form fields to the register method
    );
    // Log the user object to the console. This will be `null` if the user was not created.
    console.log(
      '🚀 ~ file: login.page.ts:50 ~ LoginPage ~ register ~ user',
      user
    );
    // Dismiss the loading spinner
    await loading.dismiss();

    // If the user is successfully created, redirect to the home page. Otherwise, display an error.
    if (user) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.showAlert('Registration failed', 'Please try again!');
    }
  }

  // The login function is called when the login form is submitted (i.e. the login button is clicked)
  // Login an existing user with the AuthService. If successful, redirect to the home page.
  async login() {
    // Create a loading overlay. This will be displayed while the request is running.
    const loading = await this.loadingController.create();
    await loading.present();
    // Call the login method from the AuthService. This returns a user object if successful, or null if unsuccessful.
    const user = await this.authService.login(this.credentials.getRawValue());
    // Log the user object to the console. This will be `null` if the user was not logged in.
    console.log('🚀 ~ file: login.page.ts:73 ~ LoginPage ~ login ~ user', user);
    // Dismiss the loading spinner
    await loading.dismiss();
    // If the user is successfully logged in, redirect to the home page. Otherwise, display an error via alert.
    if (user) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.showAlert('Login failed', 'Please try again!');
    }
  }

  // Add sendReset function to the LoginPage class. This will call the resetPw method from the AuthService.
  // This method will send a password reset email to the email address passed as parameter.
  async sendReset() {
    // Create a loading overlay. This will be displayed while the request is running.
    const loading = await this.loadingController.create();
    await loading.present();
    // Call the resetPw method from the AuthService. This returns a promise.
    await this.authService.resetPw(this.email.value);
    // Dismiss the loading spinner
    await loading.dismiss();
    // Show an alert message
    this.showAlert(
      'Password reset',
      'Check your inbox for the password reset link'
    );
  }

  // Show an alert message with the given header and message.
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
