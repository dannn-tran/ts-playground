import { describe, it, expect } from "vitest";
import { invalidNec, validNec, type ValidatedNec } from './validated.js';
import { NotImplementError } from './error.js';

describe("Validated", () => {
  it("form validation", () => {
    interface RegistrationData {
      username: string
      password: string
      firstName: string
      lastName: string
      age: number
    }

    const usernameHasSpecialCharacters = {
      type: 'username-has-special-characters' as const,
      errorMessage: 'Username cannot contain special characters.'
    }
    const passwordDoesNotMeetCriteria = {
      type: 'password-does-not-meet-criteria' as const,
      errorMessage: 'Password must be at least 10 characters long, including an uppercase and a lowercase letter, one number and one special character.'
    }
    const firstNameHasSpecialCharacters = {
      type: 'first-name-has-special-characters' as const,
      errorMessage: 'First name cannot contain spaces, numbers or special characters.'
    }
    const lastNameHasSpecialCharacters = {
      type: 'last-name-has-special-characters' as const,
      errorMessage: 'Last name cannot contain spaces, numbers or special characters.'
    }
    const ageIsInvalid = {
      type: 'age-is-invalid' as const,
      errorMessage: 'You must be aged 18 and not older than 75 to use our services.'
    }
    type DomainValidation = typeof usernameHasSpecialCharacters
      | typeof passwordDoesNotMeetCriteria
      | typeof firstNameHasSpecialCharacters
      | typeof lastNameHasSpecialCharacters
      | typeof ageIsInvalid

    type ValidationResult<A> = ValidatedNec<DomainValidation, A>

    function validateUserName(userName: string): ValidationResult<string> {
      return /^[a-zA-Z0-9]+$/.test(userName)
        ? validNec(userName)
        : invalidNec(usernameHasSpecialCharacters)
    }
    function validatePassowrd(password: string): ValidationResult<string> {
      return /(?=^.{10,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(password)
        ? validNec(password)
        : invalidNec(passwordDoesNotMeetCriteria)
    }
    function validateFirstName(firstName: string): ValidationResult<string> {
      return /^[a-zA-Z]+$/.test(firstName)
        ? validNec(firstName)
        : invalidNec(firstNameHasSpecialCharacters)
    }
    function validateLastName(lastName: string): ValidationResult<string> {
      return /^[a-zA-Z]+$/.test(lastName)
        ? validNec(lastName)
        : invalidNec(lastNameHasSpecialCharacters)
    }
    function validateAge(age: number): ValidationResult<number> {
      return (age >= 18 && age <= 75)
        ? validNec(age)
        : invalidNec(ageIsInvalid)
    }
    function validateForm(username: string, password: string, firstName: string, lastName: string, age: number): ValidationResult<RegistrationData> {
      throw new NotImplementError()
    }
  });
});