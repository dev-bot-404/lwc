import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPicklistValues from '@salesforce/apex/Session_Lwc_Fetch_Records.getPicklistValues';
import getOpportunitiesByPicklistValueAndFieldSet from '@salesforce/apex/Session_Lwc_Fetch_Records.getOpportunitiesByPicklistValueAndFieldSet';

export default class Session_Lwc_Componant extends NavigationMixin(LightningElement) {
    @api picklistField;
    fieldSetName = 'Tet_August_2024_Opportunity';

    @track picklistValues = [];
    @track opportunities = [];
    @track columns = [];
    @track selectedPicklistValue = '';
    isModalOpen = false;
    @track fieldsForModal;

    connectedCallback() {

        console.log('Picklist Field API Name:', this.picklistField);

        this.loadPicklistValues();
    }

    loadPicklistValues() {
        console.log('picklist values', this.picklistField);
        getPicklistValues({ fieldName: this.picklistField })
            .then(result => {
                console.log('Picklist Value', result);
                this.picklistValues = result;
            })
            .catch(error => {
                console.error('Error', error);
            });
    }

    handleTabClick(event) {
        console.log('Tab-->', event.target.label);
        this.selectedPicklistValue = event.target.label;
        this.getOpportunities();
    }

    getOpportunities() {
        this.opportunities = []
        console.log('opportunities--', this.selectedPicklistValue);
        getOpportunitiesByPicklistValueAndFieldSet({picklistField: this.picklistField, picklistValue: this.selectedPicklistValue, fieldSetName: this.fieldSetName})
            .then(result => {
                console.log('Opportunities--', JSON.stringify(result.opportunities, null, 2));
                console.log('Fields', result.fields);
                this.fieldsForModal = result.fields;
                this.opportunities = result.opportunities.map(opp => {
                    return {
                        ...opp,
                        accountName: opp.Account ? opp.Account.Name : ''
                    };
                });

                this.columns = result.fields.map(field => {
                    if (field === 'Account.Name') {
                        return {
                            label: 'Account Name',
                            fieldName: 'accountName',
                            type: 'text'
                        };
                    } else if (field === 'Name') {
                        return {
                            label: 'Opportunity Name',
                            fieldName: 'Name',
                            type: 'button',
                            typeAttributes: { 
                                label: { fieldName: 'Name' }, 
                                name: 'viewOpportunity',
                                variant: 'base'
                            }
                        };
                    } else {
                        return {
                            label: field,
                            fieldName: field,
                            type: 'text'
                        };
                    }
                });
            })
            .catch(error => {
                console.error('Error', error);
            });
    }

    handleRowAction(event) {
        const row = event.detail.row;
        console.log('row ', row);

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    }
    handleAdd(){
        this.isModalOpen = true;
    }
    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Account created',
            message: 'Record ID: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(evt);
        this.isModalOpen = false;
        
    }
    closeModal(){
        this.isModalOpen = false;
    }

    handleRefresh(){
        this.getOpportunities();
    }
}
