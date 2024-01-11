import { TestBed } from '@angular/core/testing';

import { AddBudgetService } from './add-budget.service';

describe('AddBudgetService', () => {
  let service: AddBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
