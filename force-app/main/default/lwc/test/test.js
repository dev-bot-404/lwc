import { LightningElement , track} from 'lwc';
import getAccounts from '@salesforce/apex/getRecords.getRecords';
import getOpportunities from '@salesforce/apex/CloudSalesController.getOpportunities';

export default class test extends LightningElement {
    @track accountOptions = [];
    selectedAccountId;
    @track opportunityRows = [];
    oppSize = 0;
    amtTotal = 0;
    notLostOppCnt = 0;
    amountEdit = false;
    stageEdit = false;

    connectedCallback(){
        this.getAccounts();
    }

    getAccounts(){
        getAccounts().then(data => {
            this.accountOptions = data.map(record => ({label: record.Name, value: record.Id}));
        });
    }

    getOpportunities(){
        this.amtTotal = 0;
        this.notLostOppCnt = 0;
        getOpportunities({accid: this.selectedAccountId}).then(data => {
            this.oppSize = data.length;
            for(let i=0; i<this.oppSize; i++){
                if(data[i].Amount != null)
                    this.amtTotal += data[i].Amount;
                if(data[i].StageName != 'Closed Lost'){
                    this.notLostOppCnt++;
                }
            }
            this.opportunityRows = data.map(record => ({
                Id: record.Id,
                Name: record.Name,
                Amount: record.Amount,
                StageName: record.StageName,
                CloseDate: record.CloseDate,
                Won: record.StageName == 'Closed Won' ? true : false,
                Lost: record.StageName == 'Closed Lost' ? true : false,
            }));
        });
    }

    handleAccountSelect(event){
        this.selectedAccountId = event.target.value;
        this.getOpportunities();
    }

    prevAmount;
    newAmount;
    handleAmountInline(event){
        this.prevAmount = event.target.dataset.id;
        console.log('prev amount: ',this.prevAmount);
        this.amountEdit = true;
    }

    amountEditHandle(event){
        this.newAmount = event.target.value;
        console.log('new amount: ',this.newAmount);
        this.amountEdit = false;
    }


    pevStage;
    newStage;
    handleStageInline(event){
        this.pevStage = event.target.StageName;
        console.log('prev stage: ',this.pevStage);
        this.stageEdit = true;

        
    }

    stageEditHandle(event){
        this.newStage = event.target.value;
        console.log('new stage: ',this.newStage);
        this.stageEdit = false;
    }
}

<template>
    <div class="slds-box" style="background-color: white;">
        <template if:true={caseList}>
            <div class="myTable">
            <lightning-datatable
            key-field="Id"
            data={caseList}
            columns={columns}
            hide-checkbox-column
            ></lightning-datatable>
        </div>
        </template>
    </div>

</template>

JS CODE- 


import { LightningElement, track } from 'lwc';
import fetchingCaseRecords from '@salesforce/apex/getRecords.getCases';

const columns = [
    { label: 'Id', fieldName: 'Id', cellAttributes: {
        style: { fieldName: 'priorityStyle' } // Dynamically assign style
    }},
    { label: 'Priority', fieldName: 'Priority', cellAttributes: {
        style: { fieldName: 'priorityStyle' } // Dynamically assign style
    }}
];

export default class ColorComponent extends LightningElement {
    @track caseList = [];
    @track columns = columns;

    connectedCallback() {
        fetchingCaseRecords().then(data => {
            this.caseList = data.map(item => {
                // Compare priority and assign a background color dynamically using inline styles
                let priorityStyle = '';
                if(item.Priority === 'High')
                {
                    priorityStyle = 'background-color: blue; color: red;';
                }
                else if(item.Priority === 'Medium')
                {
                    priorityStyle = 'background-color: orange; color: white;';
                }
                else if(item.Priority === 'Low')
                {
                    priorityStyle = 'background-color: green; color: white;';
                }
                //let priorityStyle = item.Priority === 'High' ? 'background-color: red; color: white;' : 'background-color: yellow;';
                return { ...item, priorityStyle }; // Merge the new property into the item
            });
            console.log('cases-->', this.caseList);
        }).catch(error => {
            this.error = error;
        });
    }
}