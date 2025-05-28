import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../../services/app-state.service';
import { Location, NgClass } from '@angular/common';
import { Metric } from '../../../../models';
import { ToastService } from '../../../../services/toast.service';
import { DataService } from '../../../../services/data.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopupType } from '../../../../eums';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-metric-creation-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './metric-creation-page.component.html',
  styleUrl: './metric-creation-page.component.scss',
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
export class MetricCreationPageComponent {
  activatedRoute = inject(ActivatedRoute);
  stateService = inject(AppStateService);
  location = inject(Location);
  dataService = inject(DataService);
  toastService = inject(ToastService);
  formBuilder = inject(FormBuilder);

  originalMetricName = '';
  metricId: undefined | number;

  metricForm = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required]),
    unit: this.formBuilder.control('', [Validators.required]),
    isNumeric: this.formBuilder.control(true, [Validators.required]),
  });

  readonly PopupType = PopupType;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id'] == 'undefined') {
        this.metricId = undefined;
        this.stateService.setCurrentPage('New Metric');
      } else {
        this.metricId = params['id'];
        this.initMetricData();
      }
    });
  }

  initMetricData() {
    this.dataService
      .getMetricMetadataById(this.metricId ?? 0)
      .subscribe((resp) => {
        this.originalMetricName = resp?.name ?? '';
        this.stateService.setCurrentPage(this.originalMetricName);
        this.metricId = resp?.id ?? undefined;
        this.metricForm.setValue({
          name: resp?.name ?? '',
          unit: resp?.unit ?? '',
          isNumeric: resp?.isNumeric ?? true,
        });
      });
  }
  openDeletePopup() {
    this.stateService.clearPopup();
    this.stateService.setPopup(PopupType.DELETE_METRIC_METADATA);
  }

  deleteMetric() {
    if (this.metricId) {
      this.dataService.deleteMetricMetadata(this.metricId);
    }

    this.closePopup();
    this.location.back();
  }

  saveMetricMetadata() {
    if (this.metricForm.valid && this.metricForm.value.name) {
      let met: Metric = {
        id: this.metricId,
        name: this.metricForm.value.name ?? '',
        unit: this.metricForm.value.unit ?? '',
        isNumeric: this.metricForm.value.isNumeric ?? false,
      };

      this.dataService.getMetricMetadataByName(met.name).subscribe((resp) => {
        // check if name already exists

        if (
          resp == null ||
          met.name.toLowerCase() === this.originalMetricName.toLowerCase()
        ) {
          this.dataService.saveMetricMetadata(met);
          this.toastService.showToast('Saved!');
          this.location.back();
        } else {
          this.toastService.showToast('Metric Already Exists!');
        }
      });
    } else {
      this.toastService.showToast('Invalid fields!');
    }
  }
  closePopup() {
    this.stateService.clearPopup();
  }

  toggleNumeric() {
    this.metricForm.patchValue({
      isNumeric: !this.metricForm.value.isNumeric,
    });
  }
}
