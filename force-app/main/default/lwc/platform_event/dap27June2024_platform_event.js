import { LightningElement ,api , wire ,track} from 'lwc';
import getProducts from '@salesforce/apex/Dap27June2024_platform_event.getProducts';
import createOli from '@salesforce/apex/Dap27June2024_platform_event.createOli';
import { RefreshEvent } from 'lightning/refresh';
import { getRecord} from "lightning/uiRecordApi";
import ACCID_FIELD from "@salesforce/schema/Opportunity.AccountId";
// import { subscribe, unsubscribe, onError } from 'lightning/empApi';
// import { refreshApex } from '@salesforce/apex';


const columns = [
    { label: 'Name', fieldName: 'ProductName' },
    { label: 'Price', fieldName: 'UnitPrice' },
    { label: 'Description', fieldName: 'ProductDescription' },
    {
        type: "button", label: 'View', initialWidth: 100, typeAttributes: {
            
            name: 'View',
            title: 'View',
            disabled: false,
            value: 'view',
            iconPosition: 'left',
            iconName:'utility:add',
            variant:'neutral'
        }
    },
];

export default class Dap27June2024_platform_event extends LightningElement {

    @api recordId ; 
    @track productsRecord = [];
    @track recordToShow = [];
    columns =columns;
    startindex = 0;
    endIndex = 5;
    @track nextbut = false;
    @track prevbut = true;
    oppAccountId;

    // @track subscription = {};
    // channelName = '/event/Dap27June2024_platform_event__e';

    // connectedCallback(){
    //     subscribe(this.channelName, -1, this.manageEvent).then(response => {
    //         this.subscription = response;
    //         console.log('Subscribed to platform event: ', response);
    //     });
    // }

    // manageEvent = event=> {
    //     console.log('manageEvent',event);
    //     const refreshRecordEvent = event.data.payload;
    //     console.log('refreshRecordEvent',JSON.stringify(refreshRecordEvent));
    //     if (refreshRecordEvent.accId__c == this.oppAccountId) {
    //         console.log('refreshRecordEvent.recordId__c',JSON.stringify(refreshRecordEvent.accId__c	));
    //         refreshApex(this.wiredAccount);
   
    //     }
        
    // }

    // disconnectedCallback() {
    //     unsubscribe(this.subscription, response => {
    //         console.log('Unsubscribed from platform event: ', response);
    //     });
    // }
    
    @wire(getRecord, {recordId: '$recordId' , fields: ACCID_FIELD})
    accountId({ error, data }) {
        if (data) {
            console.log('data--',JSON.stringify(data , null ,2));
            
            this.oppAccountId = data.fields.AccountId.value;
            

            console.log('oppAccountId--',JSON.stringify(this.oppAccountId , null ,2));
        } else if (error) {
            console.error('Error fetching account', error);
        }
    };

    @wire(getProducts , { recId: '$recordId'  })
    wiredAccount({ error, data }) {
        if (data) {
            console.log('data--',JSON.stringify(data , null ,2));
            
            this.productsRecord = data.map(item => {
                return {
                    ...item,
                    ProductName : item.Product2.Name,
                    ProductDescription : item.Product2.Description != null ? item.Product2.Description : '',
                    ProductIndustry : item.Product2.Industry__c,
                }
            })
            console.log('data--',JSON.stringify(this.productsRecord , null ,2));
            
            
            
            this.showData();
        } else if (error) {
            console.error('Error fetching account', error);
        }
    }

    showData(){
        console.log('show');
        if (this.productsRecord.length <= 5) {

            this.nextbut = true;
            this.prevbut = true;
            
        } else {

            this.nextbut = false;
            this.prevbut = true;
            
        }
        if(this.startindex >= 0){
            this.recordToShow = this.productsRecord.slice(this.startindex ,this.endIndex);
            console.log('recordToShow--',JSON.stringify(this.recordToShow , null ,2));
        }
        
    }
    handleNextClick(){
        console.log('next');
        this.recordToShow = [];
        console.log('next1 ',this.startindex , this.endIndex);
        
        if(this.endIndex + 5 > this.productsRecord.length){
            console.log('if');
            this.nextbut = true;
            this.prevbut = false;
            this.startindex = this.endIndex;
            this.endIndex = this.endIndex +5;

            console.log('nextif ',this.startindex , this.endIndex);
        }else{
            this.startindex = this.endIndex;
            this.endIndex = this.endIndex + 5;
            console.log('nextelse ',this.startindex , this.endIndex);
        }
        
        this.recordToShow = this.productsRecord.slice(this.startindex ,this.endIndex);
    }
        

    handlePreviousClick(){
        console.log('next');
        this.recordToShow = [];
        console.log('pre ',this.startindex , this.endIndex);
        if(this.startindex - 5 <= 0){
            this.nextbut = false;
            this.prevbut = true;
            this.startindex = 0;
            this.endIndex = 5;
            console.log('pre if ',this.startindex , this.endIndex);
        }else{
            this.startindex = this.startindex - 5;
            this.endIndex = this.endIndex - 5;
            console.log('preelse ',this.startindex , this.endIndex);
        }
        this.recordToShow = this.productsRecord.slice(this.startindex,this.endIndex);

    }

    
    async handleRowAction(event){
        var row = event.detail.row;
        console.log(JSON.stringify(row ,null,2));

        await createOli({ recId : this.recordId , product : row , accId : this.oppAccountId})
            .then(result => {
                console.log('OpportunityLineItem created successfully');
                this.handleRefresh();
            })
            .catch(error => {
                console.error('Error creating OpportunityLineItem: ', error);
            });
        
    }

    handleRefresh() {
        // refresh the standard related list
        this.dispatchEvent(new RefreshEvent());
    }


}