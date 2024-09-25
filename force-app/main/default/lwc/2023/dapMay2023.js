import { LightningElement , track} from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import conts from '@salesforce/apex/DapMay2023.fetchContacts';
import assignAccountToContact from '@salesforce/apex/DapMay2023.assignAccountToContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class DapMay2023 extends NavigationMixin(LightningElement) {

    @track showModalForContact = false;
    @track createAccount = false;
    @track contactList = [];
    @track selectedContact = [];
    @track accId;
    @track searchConName = '';
    @track searchedContacts = [];
    async handleContactName(event){
        
        this.searchConName = event.target.value;
        await conts({'search': this.searchConName}).then(data=>{
            this.searchedContacts = data.map(q => ({...q,hasAccount : false}));
            console.log('contactList',JSON.stringify(this.contactList));
            
        })
        this.contactList = this.searchedContacts;
        for (let index = 0; index < this.contactList.length; index++) {
            
            if(this.contactList[index].AccountId != null){
                this.contactList[index].hasAccount = true;
            }
                        
        }
        console.log('contactList',JSON.stringify(this.contactList));

    }


    handleCreateAccount(){
        this.createAccount = true;
    }

    async handleAddAccount(event){//

        this.accId = event.detail.id;
        console.log('ac Id --',this.accId);
        
        this.createAccount =false;
        this.showModalForContact = true;
        await conts({'search': this.searchConName}).then(data=>{
            this.contactList = data.map(q => ({...q,hasAccount : false}));
            console.log('contactList',JSON.stringify(this.contactList));
            
        })

        for (let index = 0; index < this.contactList.length; index++) {
            
            if(this.contactList[index].AccountId != null){
                this.contactList[index].hasAccount = true;
            }
                        
        }
        console.log('contactList',JSON.stringify(this.contactList));
    }


    hideModalBox() { 
        this.createAccount = false;
        this.showModalForContact = false;
    }


    handleAddSelectedContact(event){
        var conId  = event.target.dataset;
        var id = conId.id;
        this.selectedContact.push(id);
        
        
    }
    handleSelectedContacts(){
        
        assignAccountToContact({'conListToCreateAccount':this.selectedContact , 'acId':this.accId}).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: "Record Assign successfully!",
                    variant: 'success'
                })
            );
        });
        console.log('selectedContact',JSON.stringify(this.selectedContact));
        this.showModalForContact = false;
    }
}