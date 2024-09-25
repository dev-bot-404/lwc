import { LightningElement ,track , wire} from 'lwc';
import getProducts from '@salesforce/apex/DapJune2023ShoppingCart.getProducts';
import createOpportunityWithProducts from '@salesforce/apex/DapJune2023ShoppingCart.createOpportunityWithProducts';

export default class DapJune2023ShoppingCart extends LightningElement {
    @track showProducts = true;
    @track showCart = false;
    @track showCartQuantity = true;
    @track products= [];
    @track count = 0;
    @track addedToCart = [];
    @track totalAmount;
    @track showPromocode = true;
    discountedPrice = this.totalAmount;
    couponApplied = false;
    coupon = '';


    @wire(getProducts)
    showData({error,data}){
        if(data){
            this.products = data.map(item=>{
                    return {
                        ...item,
                        DisplayUrl:item.Product2.DisplayUrl,
                        Description:item.Product2.Description,
                    }
            });
            console.log('Products--',JSON.stringify(this.products , null , 2))
        }
        else if(error){
            console.log(error);
        }
    }
    
    addToCart(event){
        const product = event.target.value;
    
        let productInCart = this.addedToCart.find(item => item.Id === product.Id);

        if (productInCart) {
            productInCart.Quantity += 1;
        } else {
            this.addedToCart.push({...product, Quantity: 1});
        }
        
        console.log('Added to cart--',JSON.stringify(this.addedToCart , null ,2));
        
        this.count +=1;
        console.log('Count--',this.count);
        this.showCartQuantity = false;
        this.showCartQuantity = true;
        this.calculateTotalAmount();
    }

    handleCart(){

        this.showProducts = false;
        this.showCart = true;
        this.discountedPrice = this.totalAmount;
    }

    updateAddedProductQuantity(event){
        const product = event.target.dataset.id;
        const updatedQuantity = parseInt(event.target.value);

        console.log('Product--',product);
        console.log('Quantity--',updatedQuantity);

        this.addedToCart.map(item => {
            if(item.Id === product){
                item.Quantity = updatedQuantity;
            }
        });
        
        console.log('Updated cart--',JSON.stringify(this.addedToCart , null ,2));
        this.count += updatedQuantity -1;
        console.log('Count--',this.count);
        this.showCartQuantity = false;
        this.showCartQuantity = true;
        this.calculateTotalAmount();
    }

    removeProduct(event) {
        const productId = event.target.dataset.id;

        const addedToCart = this.addedToCart;
        const index = addedToCart.findIndex(item => item.Id === productId);

        if (index !== -1) {
            addedToCart.splice(index, 1);
        }

        console.log('Products--',JSON.stringify(this.addedToCart , null , 2));
        this.calculateTotalAmount();
    }

    clickApply() {

        this.couponApplied = true;
        const inputField = this.template.querySelector('[data-id="inputField"]');
        this.coupon = inputField.value;
        console.log('Entered Value:', this.inputValue);
        if (this.couponApplied && this.totalAmount > 0) {
            this.discountedPrice = this.totalAmount - (this.totalAmount * 0.1);
        } else {
            this.discountedPrice = this.totalAmount;
        }
        
    }

    deleteClick(){
        this.couponApplied = false;
        this.coupon = '';
        this.calculateTotalAmount();

    }
    


    calculateTotalAmount() {
       
        this.totalAmount = 0;
        
        for (let i = 0; i < this.addedToCart.length; i++) {
            this.totalAmount += parseFloat(this.addedToCart[i].UnitPrice) * this.addedToCart[i].Quantity;
        }
        this.discountedPrice = this.totalAmount;
        console.log('Total Amount:', this.totalAmount);
        this.applyCoupon(); 
    }


    createOpp(){
        var opportunityName = 'ShoppingCart' + Math.random();
        createOpportunityWithProducts({ 'opportunityName': opportunityName, 'products': this.addedToCart })
            .then(result => {
                console.log('Opportunity created successfully');
            })
            .catch(error => {
                console.error('Error creating opportunity: ', error);
            });
    }
}