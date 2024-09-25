import { LightningElement, api, track } from 'lwc';
import getAllAccountHierarchy from '@salesforce/apex/HierarchyController.getAllAccountHierarchy';

const COLUMNS_DEFINITION_BASIC = [
    { label: 'Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Employees', fieldName: 'NumberOfEmployees', type: 'text' },
    { label: 'Phone', fieldName: 'Phone', type: 'text' },
    { label: 'Owner Name', fieldName: 'OwnerName', type: 'text' },
    { label: 'Billing Address', fieldName: 'BillingAddress', type: 'text' }
];

export default class RoleHierarchyExplorer extends LightningElement {
    @track hierarchyMap = [];
    @track isLoading = false;
    @api gridColumns = COLUMNS_DEFINITION_BASIC;
    @api primaryKey = 'Id';

    connectedCallback() {
        this.isLoading = true;
        getAllAccountHierarchy()
            .then(result => {
                this.parseResult(result);
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching hierarchy data:', error);
                this.isLoading = false;
            });
    }

    parseResult(result) {
        this.hierarchyMap = [];
        result.superParentList.forEach(element => {
            this.hierarchyMap.push(this.findChildrenNode(element, result));
        });
        this.hierarchyMap = JSON.parse(JSON.stringify(this.hierarchyMap));
    }

    findChildrenNode(element, result) {
        if (result.parentMap[element[this.primaryKey]]) {
            element._children = result.parentMap[element[this.primaryKey]].map(child => {
                return this.findChildrenNode(child, result);
            });
        }
        return element;
    }
}
