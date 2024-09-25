import { LightningElement,track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import searchedRecords from '@salesforce/apex/RecordsClass.records';
import sendemail from '@salesforce/apex/RecordsClass.sendEmail';
import {NavigationMixin} from 'lightning/navigation';

export default class InternForm extends NavigationMixin(LightningElement ) {
    objectApiName = CONTACT_OBJECT;
    searchContact = true;
    isShowModal = false;
    viewRecord = false;
    editRecord = false;
    recordsFromApex;
    recordid;
    email;
    otp;
    otpFromModal;
    


    

    @track columns = [
        { label: 'Name', fieldName: 'Name' , type: 'name' },
        { label: 'Email', fieldName: 'Email', type: 'mail' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    ];
    
    handleNewContact(){

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new'                
            }
          });
    }
    
    handleSearch(){
            let se = this.template.querySelector('.mail').value;

            console.log('se',se);
            searchedRecords({'searchName':se}).then(data=>{
                console.log('data',data);

                this.recordsFromApex = data;
                console.log('recordsFromApex',this.recordsFromApex);
                
            })        
    }

    async handleContactRecord(event){

        this.recordid = String( event.target.dataset.recordid);
        console.log('recordId',this.recordid);
        this.email = String(event.target.dataset.email);
        console.log('email',this.email);
        
        await sendemail({'mailaddress':this.email}).then(data=>{
            console.log('data',data);

            this.otp = data;
            console.log('recordsFromApex',this.otp);
            
        })
        
        this.isShowModal = true;

    }
    enteredOtp(){
        
        this.otpFromModal= this.template.querySelector('.otp').value;
        console.log("modal otp input feild" ,this.otpFromModal);
    }

    handleOTP(){        
        if(this.otp == this.otpFromModal){            
            this.searchContact = false;
            this.isShowModal = false;
            this.viewRecord = true;
        }
        else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'OTP does not match',
                variant: 'Error',
            });
            this.dispatchEvent(evt);

        }

    }
    closeModal() { 
        console.log("close modal" ); 
        this.isShowModal = false;
    }

    editRecordbutton(){
        this.viewRecord = false;
        this.editRecord = true;
    }
    saveButton(){

        this.editRecord = false;
        this.viewRecord = true;
        
    }

    cancelButton(){
        this.searchContact = true;
        this.isShowModal = false;
        this.viewRecord = false;
        this.editRecord = false;
    }

    
    
}