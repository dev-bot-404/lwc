import { LightningElement , track , wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAccounts from '@salesforce/apex/TET_23August2024_CloudSales.getAccounts';
import getAssociatedOpportunites from '@salesforce/apex/TET_23August2024_CloudSales.getAssociatedOpportunites';

export default class Tet_23August2024_CloudSales extends NavigationMixin(LightningElement) {

    @track accounts ;
    selectedAccountName;
    @track associatedOpportunities = [];
    @track columns = [];
    rowOffset = 0;
    draftValues = []; 
    totalOppCount = 0;  
    totalSumOfOpp = 0;

    @wire(getAccounts)
    wiredAccount({ error, data }) {
        if (data) {
            console.log(JSON.stringify(data,null,2));
            let options = [];
                 
            for (var key in data) {
                options.push({ label: data[key].Name, value: data[key].Name});
            }
            console.log(options);
            
            this.accounts = options;
            console.log('accounts--',this.accounts);
            
        } else if (error) {
            console.error('Error fetching account', error);
        }
    }

    connectedCallback(){
        

        this.columns = [
            { label: 'Opportunity Name',
                fieldName: 'Name',
                type: 'button',
                typeAttributes: { 
                    label: { fieldName: 'Name' }, 
                    name: 'viewOpportunity',
                    variant: 'base'
                },
                cellAttributes: {
                    style: { fieldName: 'priorityClass' } 
                }
            },
            { label: 'StageName', fieldName: 'StageName', cellAttributes: {
                    style: { fieldName: 'priorityClass' } 
                }
            },
            { label: 'Amount', fieldName: 'Amount' , cellAttributes: {
                style: { fieldName: 'priorityClass' } 
            } },
            { label: 'CloseDate', fieldName: 'CloseDate' , cellAttributes: {
                style: { fieldName: 'priorityClass' } 
            } }
        ];
        console.log('User Data --->',JSON.stringify(this.columns)); 
    }

    async handleSelectAccount(event){
        this.selectedAccountName = event.target.value;
        console.log('acc--',this.selectedAccount);
        if(this.selectedAccountName != null){
            await getAssociatedOpportunites({accName : this.selectedAccountName}).then(result=>{
                console.log(result);           
                this.associatedOpportunities = result.map(item => {
                    let priorityClass = '';
                    this.totalOppCount += 1;
                    if(item.StageName !== 'Closed Lost'){
                        if (item.Amount != null) {
                            this.totalSumOfOpp = this.totalSumOfOpp + item.Amount;
                        }
                        
                    }

                    if(item.StageName === 'Closed Won') {
                        priorityClass = 'background-color: green';
                    } else if(item.StageName === 'Closed Lost') {
                        priorityClass = 'background-color: red';
                    } else {
                        priorityClass = 'background-color: white';
                    }
                    return { ...item, priorityClass };
                });
            

            }).catch(error=>{
                console.log(error);
            });
        }
        console.log('associatedOpportunities--', JSON.stringify(this.associatedOpportunities,null,2));
     
        
    }

    handleRowAction(event) {
        const row = event.detail.row;
        console.log('row ', JSON.stringify(row));

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    }


}