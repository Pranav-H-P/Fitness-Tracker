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
  metricMetadata: Metric = {
    id: -1,
    name: 'error',
    unit: 'error',
    isNumeric: false,
  };
  formBuilder = inject(FormBuilder);

  metricName = '';

  readonly PopupType = PopupType;

  metricForm = this.formBuilder.group({
    metricData: this.formBuilder.control('', [Validators.required]),
    metricNote: this.formBuilder.control(''),
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.metricMetadata.id = params['id'];
      this.initMetricData();
    });
  }

  initMetricData() {
    this.dataService
      .getMetricMetadataById(this.metricMetadata.id ?? 0)
      .subscribe((resp) => {
        this.metricMetadata = resp ?? {
          id: -1,
          name: 'error',
          unit: 'error',
          isNumeric: false,
        };
        this.metricName = this.metricMetadata.name;
        this.stateService.setCurrentPage(this.metricName);
        if (this.metricMetadata.isNumeric) {
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

        if (this.metricMetadata.id) {
          // will always be true
          this.dataService
            .getTodaysMetricEntry(this.metricMetadata.id)
            .subscribe((resp) => {
              this.metricForm.patchValue({
                metricData: resp.entry,
                metricNote: resp.note,
              });
            });
        }
      });
  }

  openDeletePopup() {
    this.stateService.clearPopup();
    this.stateService.setPopup(PopupType.DELETE_METRIC_ENTRY);
  }

  deleteMetricEntry() {
    if (this.metricMetadata.id) {
      this.dataService.deleteTodaysMetricEntry(this.metricMetadata.id);
    }
    this.closePopup();
    this.location.back();
  }

  saveMetricEntry() {
    if (this.metricForm.valid && this.metricMetadata.id) {
      this.dataService.saveMetricEntry(
        this.metricMetadata.id,
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
