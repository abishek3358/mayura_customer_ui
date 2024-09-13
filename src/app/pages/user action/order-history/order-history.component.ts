import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CheckoutService } from '../checkout/checkout.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
declare let $: any;

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  orderArr: any = [];

  statusArr: any = [];
  status: any;
  confirmedButton = false;
  shippedButton = false;
  deliveredButton = false;
  progressButton = false;
  allOrdersButton = false;
  selectedAttributes: any
  orderHistory: string = "0";
  index: any
  reviewForm: FormGroup;
  cancelForm: FormGroup;
  showReviewButton = false;
  id: any;
  data: any = {};
  orderId: any;
  reviewSubmitted = false;
  buttonText: string = "";
  selectedValue: any;
  stars: number[] = [1, 2, 3, 4, 5];
  order = [
    {
      id: '0',
      value: 'All orders',
      status: 'ALLORDERS'
    },
    {
      id: '1',
      value: 'Confirmed',
      status: 'CONFIRMED'
    },
    {
      id: '2',
      value: 'Progress',
      status: 'PROGRESS'
    },
    {
      id: '3',
      value: 'Shipped',
      status: 'SHIPPED'
    },
    {
      id: '4',
      value: 'Delivered',
      status: 'DELIVERED'
    },
    {
      id: '5',
      value: 'Completed',
      status: 'COMPLETED'
    },
    {
      id: '6',
      value: 'Cancelled',
      status: 'CANCELLED'
    }
  ]
  customerOrderId: any;
  cancelFormSubmitted = false;
  customerId: any;

  rate: number = 0;
  quality: number = 0;
  quantity: number = 0;
  service: number = 0;
  timing: number = 0;



  constructor(
    private checkoutService: CheckoutService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getOrderStatus('ALLORDERS');

    this.reviewForm = this.formBuilder.group({
      // ratings: [null, [Validators.pattern("[0-5]"),Validators.minLength(10000000000), Validators.maxLength(555555555555), Validators.required]],
      // notes: [null],
      orderId: [null],
      overallRatings: [null],
      vendorId: [null],
      id: [null],
      rawJson: {
        quality: [null],
        quantity: [null],
        rate: [null],
        service: [null],
        timing: [null],
      },
      status: 'ACTIVE'

    })
    this.cancelForm = this.formBuilder.group({
      customerOrderId: [null],
      reason: [null]
    })
  }

  duplicateArr: any = [];
arr:any=[];
  getOrderStatus(status: any) {
    this.spinner.show();
    console.log(status)
    this.orderId = status.orderId

    console.log(this.orderId)
    this.checkoutService.orderHistory(status).pipe(first()).subscribe(res => {
      this.statusArr = [];
      this.arr = res.data;
      // let arr = []
      // this.duplicateArr = res.data;
      // for (let i = 0; i < this.duplicateArr.length; i++) {
      //   let duplicate = this.duplicateArr[i];
      //   if (this.statusArr.includes(duplicate.orderId)) {
      //     arr.push(duplicate);
      //     console.log(arr);
      //   } else {
      //     this.statusArr.push(duplicate)
      //   }
      //
      // for (let i = 0; i < this.arr.length; i++) {
      //   let duplicate = this.arr[i];
      //   if (this.orderArr.some((item:any) => item.orderId === duplicate.orderId)) {
      //     this.duplicateArr.push(duplicate);
      //   } else {
      //     this.orderArr.push(duplicate);
      //   }
      // }
      this.orderArr = res.data;
      //console.log(this.orderArr);
     // console.log(this.duplicateArr);

      this.orderArr.sort((a: any, b: any) => {
        if (a.orderNo < b.orderNo) return -1;
        if (a.orderNo > b.orderNo) return 1;
        return 0;
      })
      this.spinner.hide();
      // this.toastr.success(res.message);
    }, err => {
      this.spinner.hide();
      // this.toastr.error(err.error.error.reason);
    })
  }
  visibleIndex = -1;
  showSubItem(i: any,order:any) {
    console.log(order);
    
    if (this.visibleIndex === i) {
      this.visibleIndex = -1;
    } else {
      this.visibleIndex = i;
    }
  }
  // closeReviewModal() {
  //   $('#reviewModal').modal('hide');
  //   this.reviewSubmitted = false;
  //   this.reviewForm.reset({});

  // }
  openReviewModal(reviewModal: any, order: any, event: any) {
    var isExpanded = $('#deliver').attr("aria-expanded");

    this.buttonText = "Submit";
    this.reviewForm.reset({});
    this.reviewSubmitted = false;
    this.reviewForm.patchValue({
      customerOrderId: order.orderId

    })
    $('#reviewModal').modal('show');
    this.modalService.open(reviewModal, { size: 'sm' })
  }
  singleOrder: any;
  openModal(reviewModal: any, order: any) {
    console.log(order);
    this.singleOrder = order;
    this.buttonText = "Submit";

    $('#reviewModal').modal('show');
    this.modalService.open(reviewModal, { size: 'sm' })
  }

  openCancelModal(cancelModal: any, order: any) {
    this.buttonText = "Submit";
    console.log(order);
    
    this.cancelForm.reset({});
    // this.reviewSubmitted = false;
    this.cancelForm.patchValue({
      customerOrderId: order.orderId
    })
    $('#cancelModal').modal('show');
    this.modalService.open(cancelModal, { size: 'sm' })
  }
  countStar(star: any) {
    this.selectedValue = star;
    this.reviewForm.patchValue({
      noOfStars: star
    })

  }

  reviewCompleted(modal: any) {
    this.reviewSubmitted = true;
    console.log(this.reviewForm.value);
    let obj = this.reviewForm.value;
    obj.orderId = this.singleOrder.orderId;
    obj.vendorId = this.singleOrder.vendorId;
    obj.rawJson.quality = this.quality;
    obj.rawJson.quantity = this.quantity,
      obj.rawJson.rate = this.rate,
      obj.rawJson.service = this.service,
      obj.rawJson.timing = this.timing

    this.checkoutService.rating(obj).pipe(first()).subscribe((data: any) => {
      modal.dismiss("cross click");
      this.spinner.hide();
      this.toastr.success(data.data);
    })
  }

  // getRating(event:any){

  //   console.log(event.target.value);
  //   this.currentRate = event.target.value;
  //   console.log(this.currentRate);

  //   this.Rate = event.target.value;
  //   console.log(this.Rate);

  //   this.someRate = event.target.value;
  //   console.log(this.someRate);

  //   this.lestRate = event.target.value;
  //   console.log(this.lestRate);

  //   this.testrate = event.target.value;
  //   console.log(this.testrate);


  // }

  cancelOrder(modal: any, id: any) {
    this.checkoutService.cancelOrder(this.cancelForm.value).pipe(first()).subscribe(res => {
      modal.dismiss("cross click");
      this.toastr.success(res.data);
      this.orderArr = this.orderArr.filter((res: any) => res.orderNo != id);
    })
  }
  get p() { return this.reviewForm.controls };

}
