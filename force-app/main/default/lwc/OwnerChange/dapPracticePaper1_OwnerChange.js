import { LightningElement ,track ,wire } from 'lwc';
import getRecords from '@salesforce/apex/DapPracticePaper1_OwnerChange.getRecordsOfSelectedObject';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import getUserList from '@salesforce/apex/DapPracticePaper1_OwnerChange.getUserList';
import changeOwner from '@salesforce/apex/DapPracticePaper1_OwnerChange.changeOwner';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Delete', name: 'delete' },
];


export default class DapPracticePaper1_OwnerChange extends NavigationMixin(LightningElement) {
    @track recordcolumns = [];
    @track usercolumns = [];
    @track objectData = [];
    @track selectedRowsOfObjectRecords;
    @track userRecords;
    @track error;
    @track value = '';
    showObjectTable = true; 

    @wire(getUserList)
    wiredContacts({ error, data }) {
        if (data) {
            this.userRecords = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.userRecords = undefined;
        }
    }

    connectedCallback(){
        this.usercolumns = [
            { label: 'Name', fieldName: 'Name' },
            { label: 'Username', fieldName: 'Username' },
            { label: 'Email', fieldName: 'Email' },
            { type: "button", initialWidth: 100, typeAttributes:{
                                                                    label: 'Assign',
                                                                    title: 'View',
                                                                    disabled: false,
                                                                    variant:'Brand'
                                                                }
            }
        ];
        console.log('User Data --->',JSON.stringify(this.userRecords));  
    }

    get options() {
        return [
            { label: 'Account', value: 'Account' },
            { label: 'Contact', value: 'Contact' },
            { label: 'Lead', value: 'Lead' },
            { label: 'Opportunity', value: 'Opportunity' },
            { label: 'Case', value: 'Case' },
        ];
    }

    async handleChangeInCombobox(event) {
        this.value = event.detail.value;
        console.log('Value-->',this.value);
        await getRecords({ 'objName': this.value }).then(result => {
            this.objectData = result
            this.objectData = this.objectData.map(item=>{
                return {
                    ...item,
                    OwnerName:item.Owner.Name
                }
            })
        });
        console.log('ObjectData-->',JSON.stringify(this.objectData , null ,2));
        if (this.value == 'Case') {
            this.recordcolumns = [];
            const columns = [
                { label: 'Case Number', fieldName: 'CaseNumber' },
                { label: 'Owner Name', fieldName: 'OwnerName' },
                {
                    type: 'action',
                    typeAttributes: { rowActions: actions },
                },
            ];
            this.recordcolumns=columns;
        }
        else{
            this.recordcolumns = [];
            const columns = [
                { label: 'Name', fieldName: 'Name' },
                { label: 'Owner Name', fieldName: 'OwnerName' },
                {
                    type: 'action',
                    typeAttributes: { rowActions: actions },
                },
            ];

            this.recordcolumns=columns;
        }

    }
    handleObjectRowCheck(event) {
        this.selectedRowsOfObjectRecords = event.detail.selectedRows;
        console.log('selectedRowsOfObjectRecords -->',JSON.stringify(this.selectedRowsOfObjectRecords));
        
    }
    
    handleRowActionOfObjectRecords(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        console.log('actionName--',actionName);
        console.log('row-->',JSON.stringify(row , null ,2));
        
        switch (actionName) {
            case 'delete':
                deleteRecord(row.Id).then(() => {
                    this.objectData = this.objectData.filter(item => item.Id !== row.Id);
                    this.objectData = [...this.objectData];
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: "Record deleted successfully!",
                            variant: 'success'
                        })
                    );
                }).catch((error) => {
                    console.log("error, " + error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error deleting record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                })
                
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
            default:
        }
    }

    async handleAssignButton(event){
        const recordId = event.detail.row.Id;
        console.log('recordId--' , recordId);
        var recordData = JSON.stringify(this.selectedRowsOfObjectRecords);
        console.log('recordData--' , recordData);
        this.showObjectTable = false;
        await changeOwner({'userIdToAssign' : recordId , 'recordData': recordData , 'objectName':this.value }).then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: "Record Owner Change successfully!",
                            variant: 'success'
                        })
                    );
        });
        await getRecords({ 'objName': this.value }).then(result => {
            this.objectData = result
            this.objectData = this.objectData.map(item=>{
                return {
                    ...item,
                    OwnerName:item.Owner.Name
                }
            })
        });
        this.showObjectTable = true;
    }
}