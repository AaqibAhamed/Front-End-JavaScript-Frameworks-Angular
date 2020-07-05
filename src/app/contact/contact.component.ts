import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut, visibility, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
})

export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  contactType = ContactType;
  @ViewChild('fform') feedbackFormDirective;
  feedbackCopy: Feedback;
  errFeedbackMess: string;
  visibility = 'shown';
  showSubmission: boolean;
  isLoading: boolean;

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname':
    {
      'required': 'First Name is required.',
      'minlength': 'First Name must be at least 2 characters long.',
      'maxlength': 'FirstName cannot be more than 25 characters long.'
    },
    'lastname':
    {
      'required': 'Last Name is required.',
      'minlength': 'Last Name must be at least 2 characters long.',
      'maxlength': 'Last Name cannot be more than 25 characters long.'
    },
    'telnum':
    {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email':
    {
      'required': 'Email is required.',
      'email': 'Email not in valid format.'
    },

  };

  constructor(private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private route: ActivatedRoute,
    @Inject('BaseURL') private BaseURL) {
    this.createForm();
    this.showSubmission = false;
    this.isLoading = false;
  }

  ngOnInit() {


    this.route.params
      .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.feedbackService.submitFeedback(params['feedback']); }))
      .subscribe(feedback => { this.feedback = feedback; this.feedbackCopy = feedback; this.visibility = 'shown'; },
        errmess => this.errFeedbackMess = <any>errmess);

  }

  createForm(): void {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //reser form validation error messages

  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const message = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += message[key] + ' ';
            }
          }
        }
      }
    }
  }


  onSubmit() {
    this.isLoading = true;
    this.feedback = this.feedbackForm.value;
    this.feedbackService.submitFeedback(this.feedback)
      .subscribe(feedback => {
        this.feedback = feedback;
        console.log('this Feedback', this.feedback);
        // this.feedbackCopy =feedback;
        this.isLoading = false;
        this.showSubmission = true;
        setTimeout(() => {
          this.showSubmission = false;
          this.isLoading = false;
        }, 5000)
      },
        errmess => { this.feedback = null; this.feedbackCopy = null, this.errFeedbackMess = <any>errmess; })
    this.feedbackFormDirective.resetForm();
    
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: 0,
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });

  }

}
