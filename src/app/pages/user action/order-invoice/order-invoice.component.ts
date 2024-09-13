import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CheckoutService } from '../checkout/checkout.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../pages/profile.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-invoice',
  templateUrl: './order-invoice.component.html',
  styleUrls: ['./order-invoice.component.scss']
})
export class OrderInvoiceComponent implements OnInit {
  orderArr: any = [];
  orderId: any;
  orderObj: any = {};
  orderNo: any;
  orderPlacedDate: any;
  grandTotal: any;
  paymentMode: any;
  deliveryObj: any;
  addressObj: any = {};
  customerOrderItemsDTOList: any = [];


  constructor(
    public checkoutService: CheckoutService,
    public profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.orderId = this.route.snapshot.params['id'];
    this.orderInvoice();

  }
  orderInvoice() {
    this.checkoutService.singleOrder(this.orderId).pipe(first()).subscribe(res => {
      this.orderObj = res.data;
      this.deliveryObj = res.data.deliveryAddressDtoObj;
      this.customerOrderItemsDTOList = res.data.customerOrderItemsDTOList;
      this.spinner.hide();
      // this.toastr.success(res.message);
      // this.orderNo = this.orderObj.orderNo;
      // this.orderPlacedDate = this.orderObj.orderPlacedDate;
      // this.grandTotal = this.orderObj.grandTotal;
      // this.paymentMode = this.orderObj.paymentMode;
    },
      err => {
        //  this.spinner.hide();
        this.toastr.error(err.error.error.reason);
      })
  }
  getOrderDetails() {
    this.checkoutService.singleOrder(this.orderObj.customerOrderId).pipe(first()).subscribe(res => {
      this.orderObj = res.data;
      // this.toastr.success(res.message);
    },
      err => {

        this.toastr.error(err.error.error.reason);
      })
  }
  pdfSrc: any;
  blob: any;
  download(id: any) {
    console.log(id);
    // let jwtToken = localStorage.getItem('token');
    // var pdfSrc1 = "http://101.53.155.156:8085/api/customer/order/print" + "/" + id;
    // // const requestHeaders = {
    // //   "Authorization": `BslogiKey ${jwtToken}`,
    // // };
    // fetch(pdfSrc1)
    //   .then(response => response.blob())
    //   .then(blob => {
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = "invoice.pdf";
    //     a.click();
    //     URL.revokeObjectURL(url);
    //   });
    this.http.get('http://101.53.155.156:8085/api/customer/order/print' +'/'+ id, {
      responseType: 'arraybuffer', observe: 'response'
    }).subscribe((response: any) => {
      var contentDisposition = response.headers.get("content-disposition");
      var filename = contentDisposition.split(";")[1].split("filename")[1].split("=")[1].trim();
      const file = new Blob([response.body], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = filename;
      link.click();
    })
  }
}


