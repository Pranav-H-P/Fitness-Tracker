import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../../services/app-state.service';
import { DataService } from '../../../../services/data.service';
import { Metric } from '../../../../models';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PopupType } from '../../../../eums';
import { ToastService } from '../../../../services/toast.service';
import { Location } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-metric-entry-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './metric-entry-page.component.html',
  styleUrl: './metric-entry-page.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-in', style({ opacity: 100 })),
      ]),
      transition(':leave', [
        style({ opacity: 100 }),
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class MetricEntryPageComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  stateService = inject(AppStateService);
  location = inject(Location);
  dataService = inject(DataService);
  toastService = inject(ToastService);
  metricMetadata!: Metric;
  formBuilder = inject(FormBuilder);

  metricName = '';

  readonly PopupType = PopupType;

  metricForm = this.formBuilder.group({
    metricData: this.formBuilder.control('', [Validators.required]),
    metricNote: this.formBuilder.control(''),
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.stateService.setCurrentPage(params['name']);
      this.metricName = params['name'];
      this.initMetricData();
    });
  }

  initMetricData() {
    this.dataService.getMetricMetadata(this.metricName).subscribe((resp) => {
      this.metricMetadata = resp;

      if (resp.isNumeric) {
        this.metricForm = this.formBuilder.group({
          metricData: this.formBuilder.control('', [
            Validators.required,
            Validators.pattern('^(?!$)[0-9]*.?[0-9]*$'),
          ]),
          metricNote: this.formBuilder.control(''),
        });
      } else {
        this.metricForm = this.formBuilder.group({
          metricData: this.formBuilder.control('', [Validators.required]),
          metricNote: this.formBuilder.control(''),
        });
      }
    });

    this.dataService.getTodaysMetricEntry(this.metricName).subscribe((resp) => {
      this.metricForm.patchValue({
        metricData: resp.entry,
        metricNote: resp.note,
      });
    });
  }

  openDeletePopup() {
    this.stateService.clearPopup();
    this.stateService.setPopup(PopupType.DELETE_METRIC_ENTRY);
  }

  deleteMetricEntry() {
    this.dataService.deleteTodaysMetricEntry(this.metricName);
    this.closePopup();
    this.location.back();
  }

  saveMetricEntry() {
    if (this.metricForm.valid) {
      this.dataService.saveMetricEntry(
        this.metricName,
        this.metricForm.value.metricData ?? '0',
        this.metricForm.value.metricNote ?? ''
      );
      this.toastService.showToast('Saved!');
      this.location.back();
    } else {
      this.toastService.showToast('Invalid fields!');
    }
  }
  closePopup() {
    this.stateService.clearPopup();
  }
}
