import { Component, OnInit, } from '@angular/core';
import { TopRatedProductsService } from './top-rated-products.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { BrandService } from '../other-pages/brand.service';
import { AllCategoryService } from '../all-category/all-category.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  [x: string]: any;
  productListArr: any = [];
  orderReqArray: any = [];
  cartArr: any = [];
  currentRate = 3.5;
  id: any;
  categoryId: any
  brandHomeArr: any = [];
  brand = true
  product = true
  categoryArry: any = [];
  initialCount: number = 4;
  showProduct:any=[];
  constructor(
    private topRatedService: TopRatedProductsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private brandService: BrandService,
    private allCategoryService: AllCategoryService,
  ) {
    this.topRatedService.removeCart.subscribe((res: any) => {
      this.getTopRatedProducts();
    })
    this.topRatedService.removeCheckout.subscribe((res: any) => {
      this.getTopRatedProducts();
    })
    this.topRatedService.seeCart.subscribe((res: any) => {
      this.updateCartInfo();
    })
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getAllCategories();
    this.getTopRatedProducts();
    this.getBrand();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  getAllCategories() {
    this.allCategoryService.getcategories().pipe(first()).subscribe(res => {
      this.categoryArry = res.data;
      // this.showless = this.categoryArry.slice(0, this.initialCount);
      this.spinner.hide();
      // this.toastr.success(res.message);
    }, err => {
      this.spinner.hide();
      this.toastr.error(err.error.error.reason);
    })
  }

  category(id: any) {
    this.router.navigate(['/products'], { queryParams: { categoryId: id } })

  }
  more: boolean=false;
  // showless:any[]=[]
  show() {
    this.more = !this.more;
    // this.updateShowLess();
}

// updateShowLess() {
//     if (this.more) {
//         this.showless = this.categoryArry;
//     } else {
//         this.showless = this.categoryArry.slice(0, this.initialCount);
//     }
// }
  getTopRatedProducts() {

    this.topRatedService.getTopRatedProducts().pipe(first()).subscribe(res => {
      //  this.toastr.success(res.message);
      this.productListArr = res.data;
      this.spinner.hide();
      this.cartArr = JSON.parse(localStorage.getItem('cartData')!);
      if (this.cartArr) {
        for (let i = 0; i < this.productListArr.length; i++) {
          const found = this.cartArr.find((element: any) => this.productListArr[i].productDtlId === element.productDtlId);
          if (found) {
            this.productListArr[i].orderQty = found.orderQty;
            this.productListArr[i].productId = found.productId;
          }
        }
      }
    }, err => {
      this.spinner.hide();
    })
  }

  updateCartInfo() {
    const localData = JSON.parse(localStorage.getItem('cartData')!);
    for (let i = 0; i <= this.productListArr.length; i++) {
      const cart = localData.find((data: any) => data?.productDtlId === this.productListArr[i]?.productDtlId);
      if (cart) {
        this.productListArr[i].orderQty = cart.orderQty;
      }
    }
  }

  cartValues() {
    this.orderReqArray = this.topRatedService.getCartData();
    if (this.orderReqArray) {
      for (let i = 0; i < this.orderReqArray.length; i++) {
        for (let j = 0; j < this.productListArr.length; j++) {
          if (this.productListArr[j].productDtlId == this.orderReqArray[i].productId) {
            this.productListArr[j].productId = this.orderReqArray[i].productId;
            this.productListArr[j].orderQty = this.orderReqArray[i].orderQty;
          }
        }
      }
    }

  }

  addToCart(obj: any) {
    for (let list of this.productListArr) {
      if (list.productDtlId == obj.productDtlId) {
        list.productId = list.productDtlId;
        list.orderQty = 1;
        // list.productName = obj.name;
        list.orderQuantityAmount = (list.orderQty * list.price);
        this.toCheckItsInLocal(list);
        this.topRatedService.getCart(list);
      }
    }
  }

  toCheckItsInLocal(cartObj: any) {
    this.orderReqArray = this.topRatedService.getCartData();
    if (this.orderReqArray) {
      for (let i = 0; i < this.orderReqArray.length; i++) {
        if (cartObj.productId == this.orderReqArray[i].productId) {
          this.orderReqArray.splice(i, 1);
        }
      }
      localStorage.setItem('cartData', JSON.stringify(this.orderReqArray));
      this.setToLocal(cartObj);
    } else {
      this.setToLocal(cartObj);
    }
  }

  setToLocal(obj: any) {
    var a;
    if (localStorage.getItem('cartData') === null) {
      a = [];
    } else {
      a = JSON.parse(localStorage.getItem('cartData')!);
    }
    a.push(obj);
    localStorage.setItem('cartData', JSON.stringify(a));
  }

  decreaseQuantity(obj: any) {
    for (let list of this.productListArr) {
      if (list.productDtlId == obj.productDtlId) {
        if (list.orderQty > 1) {
          list.orderQty = list.orderQty - 1;
          list.orderQuantityAmount = (list.orderQty * list.price);
          this.toCheckItsInLocal(list);
          this.topRatedService.getCart(list);
        }
      }
    }
  }

  increaseQuantity(obj: any) {
    for (let list of this.productListArr) {
      if (list.productDtlId == obj.productDtlId) {
        list.orderQty = list.orderQty + 1;
        list.orderQuantityAmount = (list.orderQty * list.price);
        this.toCheckItsInLocal(list);
        this.topRatedService.getCart(list);
      }
    }
  }


  getBrand() {
    this.brandService.getBrandList().pipe(first()).subscribe(res => {
      this.brandHomeArr = res.data
      // this.toastr.success(res.data.message);
    })
  }
  brandGet(id: any) {
    this.router.navigate(['/products'], { queryParams: { brandId: id } })

  }
}









