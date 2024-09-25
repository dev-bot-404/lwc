import { LightningElement , wire , track } from 'lwc';
import getOpp from '@salesforce/apex/DapPaper2_Delta_Services.getOpp';
import{ refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin} from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import STAGE_FIELD from "@salesforce/schema/Opportunity.StageName";
import ID_FIELD from "@salesforce/schema/Opportunity.Id";

export default class DapPaper2_Delta_Services extends NavigationMixin(LightningElement) {
    @track selectedStageName = 'All';
    @track opportunities;

    recId;
    @track showModal = false;
    modalselectedStageName;
    mainData;
    @wire(getOpp,{stage_name:'$selectedStageName'})
    wiredOpportunities(dd)
    {  this.mainData=dd;
        let {data , error}=this.mainData;
        if(data)
        {
                       
            this.opportunities = data.map(item => {
                if (item.StageName == 'Closed Won') {
                    return {
                        ...item,
                        isClosedWon:true,
                        isClosedLost:false,
                        isOpen:false
                    }
                    
                } else if (item.StageName == 'Closed Lost'){
                    return {
                        ...item,
                        isClosedWon:false,
                        isClosedLost:true,
                        isOpen:false
                    }
                }
                else{
                    return {
                        ...item,
                        isClosedWon:false,
                        isClosedLost:false,
                        isOpen:true
                    }
                }
            });
            console.log('opportunities' , JSON.stringify(this.opportunities , null ,2 ));
        }
        else if (error){
            console.log('error occured'+error);
        }
    }


    get options() {
        
        return [
            { label: 'All', value: 'All' },
            { label: 'Prospecting', value: 'Prospecting' },
            { label: 'Qualification', value: 'Qualification' },
            { label: 'Needs Analysis', value: 'Needs Analysis' },
            { label: 'Value Proposition', value: 'Value Proposition' },
            { label: 'Id. Decision Makers', value: 'Id. Decision Makers' },
            { label: 'Perception Analysis', value: 'Perception Analysis' },
            { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
            { label: 'Negotiation/Review', value: 'Negotiation/Review' },
            { label: 'Closed Won', value: 'Closed Won' },
            { label: 'Closed Lost', value: 'Closed Lost' },
        ];
    }

    get modalOptions() {
        return [
            { label: 'Closed Won', value: 'Closed Won' },
            { label: 'Closed Lost', value: 'Closed Lost' },
        ];
    }

    handleStageNameChange(event) {
        this.selectedStageName = event.detail.value;
        console.log('selected stage name' , this.selectedStageName);
       
        
        return refreshApex(this.mainData);
        
    }

    handleViewOpportunity(event){
        this.recId = event.target.value;
        console.log('record id' , this.recId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recId,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });


    }

    handleCloseOpportunity(event){
        this.recId = event.target.value;
        console.log('record id' , this.recId);
        this.showModal = true;
    }

    async handleDeleteOpportunity(event){
        this.recId = event.target.value;
        console.log('record id' , this.recId);
    
        try {
            await deleteRecord(this.recId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account deleted',
                    variant: 'success'
                })
            );
            // this.opportunities = [];
            // console.log('1',this.opportunities);
            
            const temp = this.selectedStageName;
            console.log('2',temp);
            this.selectedStageName = temp;
            console.log('3',this.selectedStageName);
            return refreshApex(this.mainData);
            
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting record',
                    message: error,
                    variant: 'error'
                })
            );
        }
        
        
    }

    hideModalBox(){

        this.showModal = false;
    }

    handleStageChange(event){

        this.modalselectedStageName = event.detail.value;
        console.log('selected stage name' , this.modalselectedStageName);
        
    }

    async handleUpdateStage(){

        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recId;
        fields[STAGE_FIELD.fieldApiName] = this.modalselectedStageName;
        
        const recordInput = {
            fields: fields
          };
        

          updateRecord(recordInput).then((record) => {
            this.dispatchEvent(
                new ShowToastEvent({
                title: "Success",
                message: "Contact updated",
                variant: "success",
                }),
            );
            // this.opportunities = [];
            // console.log('1',this.opportunities);
            
            const temp = this.selectedStageName;
            console.log('2',temp);
            this.selectedStageName = temp;
            console.log('3',this.selectedStageName);
            return refreshApex(this.mainData);
            })
            .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                title: "Error creating record",
                message: error.body.message,
                variant: "error",
                }),
            );
        });

        this.showModal = false;
    }

    



}