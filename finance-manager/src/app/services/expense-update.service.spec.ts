import { TestBed } from '@angular/core/testing';

import { ExpenseUpdateService } from './expense-update.service';

describe('ExpenseUpdateService', () => {
  let service: ExpenseUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
