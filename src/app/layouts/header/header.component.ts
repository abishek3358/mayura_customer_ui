import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/app/pages/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { TopRatedProductsService } from 'src/app/pages/home/top-rated-products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { FavouriteService } from 'src/app/pages/favourite/favourite.service';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from 'src/app/pages/pages/profile.service';
import { ProductsComponent } from 'src/app/pages/products/products.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AllCategoryService } from 'src/app/pages/all-category/all-category.service';
import { OffersService } from 'src/app/pages/offer/offers.service';


declare let $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  name = 'angular'

  SearchForm!: FormGroup;
  categoryForm!: FormGroup;
  sidebar: boolean = false;
  public loggedInUserName: string | undefined;
  currentUrl: any;
  orderReqArray: any = [];
  productListArr: any = [];
  previousUrl: any;
  array: any = [];
  calculateObj: any = {};
  searchObj: any = [];
  filterArr: any = [];
  listObj: any = {};
  favProductArr: any = [];
  public showCouponCode = false;
  id: any
  fileUrl: any
  searchkey: any
  fileName: any = {};
  activeLink: string = 'home';
  coupen: string = '';
  searchValue: string = '';
  constructor(
    public authService: AuthenticationService,
    public topRatedService: TopRatedProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public favService: FavouriteService,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,
    private allCategoryService: AllCategoryService,
    private offerService: OffersService,

  ) {
    this.topRatedService.viewCart.subscribe((res: any) => {
      this.productListArr = JSON.parse(localStorage.getItem('cartData')!);
      this.calculation();
    }, err => {
      this.toastr.error(err.error.error.reason);
    });

    this.topRatedService.removeCheckout.subscribe((res: any) => {
      this.productListArr = JSON.parse(localStorage.getItem('cartData')!);
      this.calculation();
    }, err => {
      this.toastr.error(err.error.error.reason);
    });

    this.topRatedService.removeCart.subscribe((res: any) => {
      this.getCartData();
      this.calculation();
    }, err => {
      this.toastr.error(err.error.error.reason);
    });

    this.favService.viewWishList.subscribe((res: any) => {
      this.getFav();
    }, err => {
      this.toastr.error(err.error.error.reason);
    });
  }

  ngOnInit(): void {

    this.SearchForm = this.formBuilder.group({
      searchKey: [null],
    })

    this.productListArr = JSON.parse(localStorage.getItem('cartData')!);
    console.log(this.productListArr);

    const offerJson = localStorage.getItem('offer');
    if (offerJson) {
      this.offer = JSON.parse(offerJson);
      console.log(this.offer);
      this.coupen = this.offer[0]?.offerCode;
      if (this.coupen) {
        this.resetOfferValue();
      }
    }

    // this.offer = JSON.parse(localStorage.getItem('offer')!);
    // console.log(this.offer);
    // this.coupen = this.offer[0]?.offerCode;
    // if (this.coupen) {
    //   this.resetOfferValue()
    // }
    this.getCartData();
    // this.previousUrl=this.route.snapshot.params['previousUrl'];
    this.calculation();
    // this.getFav();
    // this.productsearch();
    this.getUserProfile();
    this.getAllCategories();
    // this.getUserImage();
    // this.search();
    this.getOffer();
  }

  logout() {
    this.authService.logout();
    this.getCartData();
    this.calculation();
    localStorage.removeItem('offer');
  }

  getUserDetails() {
    this.authService.getUserDetails().pipe(first()).subscribe((res) => {
      // this.toastr.success(res.message);
      localStorage.setItem('currentUser', JSON.stringify(res.data));
      if (res.data.loginObj.roleObj.roleName == 'ADMIN') {
        this.router.navigate([this.currentUrl]);
      } else {
        this.router.navigate([this.currentUrl]);

      }
    },
      err => {

        this.toastr.error(err.error.error.reason);
      }
    );
  }

  getCartData() {
    this.productListArr = this.topRatedService.getCartData();
  }

  getFav() {
    this.favService.getFav().pipe(first()).subscribe(res => {
      this.favProductArr = res.data
    },
      err => {

        this.toastr.error(err.error.error.reason);
      })

  }

  toCheckItsInLocal(cartObj: any) {
    let orderReqArray = this.topRatedService.getCartData();
    if (orderReqArray) {
      for (let i = 0; i < orderReqArray.length; i++) {
        if (cartObj.productId == orderReqArray[i].productId) {
          orderReqArray.splice(i, 1);
        }
      }
      localStorage.setItem('cartData', JSON.stringify(orderReqArray));
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

  calculation() {
    this.array = JSON.parse(localStorage.getItem('cartData')!);
    console.log(this.array);
    // this.coupen = this.array[0].offerCode[0].offerCode;
    let totalCost = 0;
    if (this.array) {
      for (let i = 0; i < this.array.length; i++) {
        let orderQuantityAmount = this.array[i].orderQuantityAmount;
        totalCost = totalCost + orderQuantityAmount;
      }
      this.calculateObj.totalCost = totalCost;
      //this.selectOffer(totalCost);
      // if (this.coupen) {
      //   this.calculationOffer(totalCost);
      // }
    } else {
      this.calculateObj.totalCost = "0.00";
    }
  }

  // calculationOffer(totalAll: number) {
  //   const percentage = this.array[0].offerCode[0].offerValue;
  //   const total = this.array[0].offerCode[0].minimumOrderAmount;
  //   if (total <= totalAll) {
  //     const discount = (totalAll * percentage) / 100;
  //     this.totalAmt = totalAll - discount;
  //     this.offerShow = true;
  //   }
  // }

  decreaseQuantity(obj: any) {
    for (let list of this.productListArr) {
      if (list.id == obj.id) {
        if (list.orderQty > 1) {
          list.orderQty = list.orderQty - 1;
          // this.listObj.orderQty = list.orderQty;
          list.orderQuantityAmount = (list.orderQty * list.price);
          this.toCheckItsInLocal(list);
          this.topRatedService.getData(list);
          this.calculation();
          //  this.selectOffer(list.orderQuantityAmount);

          if (this.coupen) {
            this.offerSubmit();
          } else {
            let data = 0;
            //this.offer=[];
            // this.coupen = '';
            if (this.coupen) {
              this.resetOfferValue();
            }
            this.notSetOfferAmt(data, this.offer);
          }
        }
      }
    }
  }

  increaseQuantity(obj: any) {
    for (let list of this.productListArr) {
      if (list.id == obj.id) {
        list.orderQty = list.orderQty + 1;
        // this.listObj.orderQty = list.orderQty;
        list.orderQuantityAmount = (list.orderQty * list.price);
        this.toCheckItsInLocal(list);
        this.topRatedService.getData(list);
        // console.log(list);

        //  this.selectOffer(list.orderQuantityAmount);

        this.calculation();
        if (this.coupen) {
          this.offerSubmit();
        } else {
          let data = 0;
          // this.offer = [];
          // this.resetOfferValue();
          this.coupen = '';
          this.notSetOfferAmt(data, this.offer);
        }
      }
    }
  }

  removeFromCart(productId: any, productDtlId: any) {
    console.log(productDtlId);
    console.log(productId);

    // const cateArr = JSON.parse(localStorage.getItem('cateArr')!);
    // const foundIndex = cateArr.findIndex((data: any) => data.id == productId);
    // cateArr[foundIndex].orderQty = null;
    // localStorage.setItem('cateArr', JSON.stringify(cateArr));
    for (var i = 0; i < this.productListArr.length; i++) {
      if (this.productListArr[i].productId == productId) {
        this.productListArr.splice(i, 1);
        break;
      }
    }
    localStorage.setItem('cartData', JSON.stringify(this.productListArr));
    this.getCartData();
    this.calculation();
    this.topRatedService.getRemove(productDtlId);
    if (this.coupen) {
      this.offerSubmit();
    } else if (this.coupen == '' && this.offer.length) {
      console.log(this.coupen == '' && this.offer.length);
      this.resetOfferValue();
    }
    // this.toastr.success('Item removed successfully.!', 'Success!');

  }

  preventScroll() {
    if (this.sidebar) {
      $('body').css('overflow', 'hidden');
      this.array = JSON.parse(localStorage.getItem('cartData')!);
      console.log(this.array);
      if (this.coupen) {
        this.offerSubmit();
        this.calculation();
      }

    } else {
      $('body').css('overflow', 'inherit');
      let currentUrl = this.router.url;
      console.log(currentUrl)
      if (currentUrl == '/checkout' && this.productListArr.length) {
        //   this.offer = JSON.parse(localStorage.getItem('offer')!);
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
        if (this.coupen) {
          this.offerSubmit();
        }
        this.array = JSON.parse(localStorage.getItem('cartData')!);
        let totalCost = 0;
        for (let i = 0; i < this.array.length; i++) {
          let orderQuantityAmount = this.array[i].orderQuantityAmount;
          totalCost += orderQuantityAmount;
        }
        console.log(totalCost);
        this.selectOffer(totalCost);
        //localStorage.setItem('offer', this.offer);
        if (this.offer == '') {
          if (this.yourOffer) {
            // this.sidebar = true;
            console.log(this.yourOffer);
            // localStorage.setItem('offer', this.yourOffer)
            this.toastr.success('Check Your Offer','Your Amount is Eligible for Offer');
          //  this.router.navigate(['/offer'])
          }
          //  else {
          //   this.sidebar = false;
          // }
        }
      } else {
        if (this.coupen) {
          this.offerSubmit();
        }
        this.array = JSON.parse(localStorage.getItem('cartData')!);
        // this.offer = JSON.parse(localStorage.getItem('offer')!);

        console.log(this.array);
        let totalCost = 0;
        for (let i = 0; i < this.array.length; i++) {
          let orderQuantityAmount = this.array[i].orderQuantityAmount;
          totalCost += orderQuantityAmount;
        }
        console.log(totalCost);
        this.selectOffer(totalCost);
        if (this.offer == '') {
          if (this.yourOffer) {
            // this.sidebar = true;
            console.log(this.yourOffer);
            // localStorage.setItem('offer', this.yourOffer)
            this.toastr.success('Check Your Offer','Your Amount is Eligible for Offer');
         //   this.router.navigate(['/offer'])
          }
          //  else {
          //   this.sidebar = false;
          // }
        }
      }
    }
  }

  offerArr: any = [];
  offer: any = [];

  getOffer() {
    this.offerService.getOffer().pipe(first()).subscribe(res => {
      this.offerArr = res.data;
      localStorage.setItem('offerArr', JSON.stringify(this.offerArr))
      console.log(this.offerArr);

      // this.offer = this.offerArr;
      this.spinner.hide();
      // this.toastr.success(res.message)
    }, err => {
      this.spinner.hide();
      this.toastr.error(err.error.error.reason);
    });
  }
  yourOffer: any = null;
  selectOffer(total: number) {
    // Filter offers where minimumOrderAmount is less than or equal to total
    const eligibleOffers = this.offerArr.filter((offer: any) => offer.minimumOrderAmount <= total);
    // Sort eligible offers by minimumOrderAmount in descending order
    eligibleOffers.sort((a: any, b: any) => b.minimumOrderAmount - a.minimumOrderAmount);
    // Select the first (highest) eligible offer
    this.yourOffer = eligibleOffers[0];
  }

  offerShow: boolean = false;
  totalAmt: number = 0;

  offerSubmit() {
    console.log(this.coupen);
    if(this.coupen == undefined || this.coupen == ''){
      this.toastr.warning('Please enter a coupon code', 'No Coupon Code');
    }
    this.offer = this.offerArr.filter((res: any) => {
      return res.offerCode === this.coupen
    });
    localStorage.setItem('offer', JSON.stringify(this.offer));
    if (this.coupen == '') {
      this.array = JSON.parse(localStorage.getItem('cartData')!);
      console.log(this.array);
      let totalCost = 0;
      for (let i = 0; i < this.array.length; i++) {
        let orderQuantityAmount = this.array[i].orderQuantityAmount;
        totalCost += orderQuantityAmount;
      }
      console.log(totalCost);
      this.selectOffer(totalCost);
    } else if(this.coupen) {
      if (this.offer.length == 0) {
        this.toastr.error("Did Not Match The Offer Code");
        this.showCouponCode = false;
        this.coupen = '';
        console.log(this.offer);
      } else if (this.offer.length > 1) {
        this.toastr.error("Multiple Offer Code Match");
        this.showCouponCode = false;
        this.coupen = '';
      } else {
        this.resetOfferValue();
      }
    }
  }

  resetOfferValue() {
    this.array = JSON.parse(localStorage.getItem('cartData')!);
    console.log(this.array);
    if (this.array) {
      let totalCost = 0;
      for (let i = 0; i < this.array.length; i++) {
        let orderQuantityAmount = this.array[i].orderQuantityAmount;
        totalCost += orderQuantityAmount;
      }
      if (this.offer) {
        const percentage = this.offer[0]?.offerValue;
        const total = this.offer[0]?.minimumOrderAmount;
        if (total <= totalCost) {
          const discount = (totalCost * percentage) / 100;
          this.totalAmt = totalCost - discount;
          this.offerShow = true;
          this.offerAmount(this.totalAmt, this.offer);
          this.showCouponCode = false;
        } else {
          this.showCouponCode = false;
          this.offerShow = false;
          this.coupen = '';
          this.toastr.error("Minimum Amount Not Purchase");
          this.offer = [];
          localStorage.setItem('offer', JSON.stringify(this.offer));
          console.log(this.offer);
          let data = 0;
          this.notSetOfferAmt(data, this.offer);
        }
      }
    }
  }

  notSetOfferAmt(data: number, code: number) {
    let orderReqArray = this.topRatedService.getCartData();
    console.log(orderReqArray);
    if (orderReqArray) {
      for (let i = 0; i < orderReqArray.length; i++) {
        let offerDis = orderReqArray[i].offerAmt;
        // let offerCode = orderReqArray[i].offerCode;
        // orderReqArray[i].offerCode = code;
        orderReqArray[i].offerAmt = data;
      }
    }
    localStorage.setItem('cartData', JSON.stringify(orderReqArray));
  }

  offerAmount(data: number, code: number) {
    if (data) {
      let orderReqArray = this.topRatedService.getCartData();
      console.log(orderReqArray);
      if (orderReqArray) {
        for (let i = 0; i < orderReqArray.length; i++) {
          let offerDis = orderReqArray[i].offerAmt;
          // let offerCode = orderReqArray[i].offerCode;
          // orderReqArray[i].offerCode = code;
          orderReqArray[i].offerAmt = data;
        }
      }
      localStorage.setItem('cartData', JSON.stringify(orderReqArray));
    }
  }

  filter() {
    this.topRatedService.filterProduct(this.SearchForm.value).pipe(first()).subscribe(res => {
      this.filterArr = res.data;
      this.toastr.success(res.data);
    },
      err => {

        this.toastr.error(err.error.error.reason);
      })
  }
  getUserProfile() {
    this.profileService.getUserProfile().pipe(first()).subscribe(res => {
      //  this.toastr.success(res.data);
      this.fileUrl = res.data.fileUrl;
      this.fileName = res.data.fileName;
      localStorage.setItem('login', JSON.stringify(res.data));
      // this.toastr.success(res.message);
    },
      // err => {
      //   this.toastr.error(err.error.error.reason);
      //   this.spinner.hide();
      // }
    )
  }
  // getUserImage(){
  //   this.profileService.getUserProfile().pipe(first()).subscribe(res =>{
  //     localStorage.setItem('login',JSON.stringify(res.data));
  //   })
  //     }
  categoryArry: any = [];
  getAllProducts: any = [];
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
  showSuggestions: boolean = false;
  dataFilter(event: any) {
    if (event && event.target) {
      const inputValue = event.target.value;
      if (inputValue.trim() === '') {
        this.showSuggestions = false; // Hide suggestions if the input value is empty
      } else {

        this.getAllProducts = this.categoryArry.filter((res: any) => {
          const input = inputValue.trim().toLowerCase();
          return res.categoryName.toLowerCase().includes(input);
        })
        this.showSuggestions = true;
      }
    }
  }

  filterData(product: any) {
    console.log(product);
    this.searchValue = product.categoryName; // Set the searchValue
    this.showSuggestions = false;
  }

  search() {
    // this.router.navigate(['/products/{{searchObj.searchKey}}'])
    this.router.navigate(['/products'], { queryParams: { searchKey: this.SearchForm.get('searchKey')?.value } })
    this.SearchForm.reset({});
    //   this.topRatedService.searchProduct(this.SearchForm.value).pipe(first()).subscribe(res => {
    //     this.searchObj = res.data;
    //     this.topRatedService.getSearch(res.data)
    //     this.toastr.success(res.data);
    //     this.getSearchBrand();
    //   this.router.navigate(['/products/{{searchObj.searchKey}}'])
    // },
    // err => {

    //   this.toastr.error(err.error.error.reason);
    //   this.spinner.hide();

    //     // this.router.navigate(['/products/{searchKey:id}'])
    //   })
  }

  getSearchBrand() {
    this.topRatedService.filterProduct(this.SearchForm.value).pipe(first()).subscribe(res => {
      this.filterArr = res.data;
      this.topRatedService.getFilter(res.data);
    })
  }
}
