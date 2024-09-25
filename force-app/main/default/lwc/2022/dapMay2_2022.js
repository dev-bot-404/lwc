import { LightningElement, wire  } from 'lwc';
import getAccountList from "@salesforce/apex/DapMay2_2022.getdata";
import{ NavigationMixin } from 'lightning/navigation';
import{ deleteRecord } from 'lightning/uiRecordApi';
import{ ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DapMay2_2022 extends NavigationMixin (LightningElement) {

    accountsData;
    wiredAccount;

    @wire(getAccountList)
    wiredAccounts(response) {
        this.wiredAccount = response;
        let { error, data } = response;
        if (data) {
        let parseData = JSON.parse(JSON.stringify(data));
        this.accountsData = parseData;
        console.log(this.accountsData);
        } else if (error) {
        this.error = error;
        this.accountsData = undefined;
        }
    }

    handleEditAccount(event) {
        const accrecordId = event.target.dataset.id;
        console.log('Edit Account: ' + accrecordId);
        this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: accrecordId,
            objectApiName: 'Account',
            actionName: 'edit'
    }
    });
    }

    handleDeleteAccount(event) {
        let accrecordId = event.target.dataset.id;
        console.log('Deleting account with Id:', accrecordId);
        deleteRecord(accrecordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account has been deleted',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while deleting',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }



    handleconDelete(event) {
        const conrecordId = event.target.dataset.id; 
        console.log('Deleting contact with Id:', conrecordId);

        deleteRecord(conrecordId)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'The contact has been deleted',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while deleting',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    handleoppDelete(event) {
        const opprecordId = event.target.dataset.id; 
        console.log('Deleting opportunity with Id:', opprecordId);

        deleteRecord(opprecordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'The opportunity has been deleted successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        }
}
