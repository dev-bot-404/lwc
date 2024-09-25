import { LightningElement , track, api } from 'lwc';
import getAccounts from '@salesforce/apex/DapFeb2023.getAccounts';
import getContacts from '@salesforce/apex/DapFeb2023.getContacts';
import getPricebook from '@salesforce/apex/DapFeb2023.getPricebook';
import getProductsFromPricebook from '@salesforce/apex/DapFeb2023.getProductsFromPricebook';
import createOpportunityAndOLIs from '@salesforce/apex/DapFeb2023.createOpportunityAndOLIs';


export default class DapFeb2023 extends LightningElement {
    //----------------------------
    isListening = false;
    pickListOrdered;
    searchResults;
    selectedSearchResult;
    @track relatedContacts = [];
    @track selectedPriceBook = [];
    @track selectedProducts = [];
    @track selectedPriceBookEntry = [];
    @track selectedAccountId = '';
    @track selectedContactId = '';
    disableContactField = true;
    closeDate;
    //----------------------------

    @track oliList = [];
    @track index = 0;
    @track prodList;

    isLoaded = false;

    prod = {
        Name: '',
        Quantity: '',
        UnitPrice: '',
        ListPrice: '',
        Total: '',
        ProductId: '',
        PricebookEntryId:'',
        key: ''
    }

    addRow() {
        this.index++;
        const newProd = { ...this.prod, key: this.index };
        this.oliList.push(newProd);
        console.log('OliList after adding row: ', this.oliList);
    }

    removeAllRow() {
        this.oliList = [];
    }

    handleSelectedProduct(event) {
        const key = event.currentTarget.dataset.id;
        const selectedRowProductName = event.target.value;
        const rec = this.selectedProducts.find(product => product.Product2.Name === selectedRowProductName);

        if (rec) {
            const updatedProd = { ...this.oliList[key - 1], ...{
                Name: selectedRowProductName,
                UnitPrice: rec.UnitPrice,
                ListPrice: rec.UnitPrice,
                ProductId: rec.Product2Id,
                PricebookEntryId: rec.Id,
            }};
            this.oliList[key - 1] = updatedProd;
            console.log(`Updated OliList at index ${key - 1}: `, JSON.parse(JSON.stringify(updatedProd)));
            this.oliList = [...this.oliList];
        }
    }

    handleQuantityChange(event) {
        const key = event.currentTarget.dataset.id;
        const selectedRowQuantity = event.target.value;
        this.oliList[key - 1] = {
            ...this.oliList[key - 1],
            Quantity: selectedRowQuantity,
            Total: selectedRowQuantity * this.oliList[key - 1].UnitPrice
        };
    
        this.oliList = [...this.oliList];
    }

    handleCloseDate(event) {
        this.closeDate = event.target.value;
        console.log('closeDate: ', this.closeDate);
    }

    //-------------Account search combobox---------------------------------
    get selectedValue() {
        return this.selectedSearchResult?.label ?? null;
    }

    connectedCallback() {
        getAccounts().then((result) => {
            this.pickListOrdered = result.sort((a, b) =>
                a.label.localeCompare(b.label)
            );
        });
    }

    renderedCallback() {
        if (this.isListening) return;
        window.addEventListener("click", (event) => {
            this.hideDropdown(event);
        });
        this.isListening = true;
    }

    hideDropdown(event) {
        const cmpName = this.template.host.tagName;
        const clickedElementSrcName = event.target.tagName;
        const isClickedOutside = cmpName !== clickedElementSrcName;

        if (this.searchResults && isClickedOutside) {
            this.clearSearchResults();
        }
    }

    search(event) {
        const input = event.detail.value.toLowerCase();
        this.searchResults = this.pickListOrdered.filter((pickListOption) =>
            pickListOption.label.toLowerCase().includes(input)
        );
    }

    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.selectedAccountId = selectedValue;
        this.selectedSearchResult = this.pickListOrdered.find(
            (pickListOption) => pickListOption.value === selectedValue
        );
    
        if (this.selectedAccountId !== selectedValue) {
            this.relatedContacts = [];
            this.selectedContactId = '';
        }
    
        this.handleContactSearch();
        this.handlePricebookSearch();
    
        if (this.selectedSearchResult) {
            this.disableContactField = false;
        }
        
        this.clearSearchResults();
    }

    clearSearchResults() {
        this.searchResults = null;
        if (this.selectedAccountId === '') {
            this.relatedContacts = [];
            this.selectedContactId = '';
        }
    }

    showPickListOptions() {
        if (!this.searchResults) {
            this.searchResults = this.pickListOrdered;
        }
    }

    //-----------Contact Combobox -----------------------------------------------
    get contactOptions() {
        return this.relatedContacts;
    }

    async handleContactSearch() {
        const acId = this.selectedAccountId;
        await getContacts({ 'accId': acId }).then(result => {
            this.relatedContacts = result.map(contact => ({
                label: contact.Name,
                value: contact.Id
            }));
        });
    }

    handleSelectedContact(event) {
        this.selectedContactId = event.detail.value;
        console.log('Selected Contact Id:', this.selectedContactId);
        this.handlePricebookSearch();
    }

    //-----------Pricebook Combobox -----------------------------------------------
    get pricebookOptions() {
        return this.selectedPriceBook;
    }

    async handlePricebookSearch() {
        await getPricebook().then(result => {
            this.selectedPriceBook = result.map(pricebook => ({
                label: pricebook.Name,
                value: pricebook.Id
            }));
            console.log('Pricebooks',JSON.stringify(result, null, 2));
        });

    }

    get productOptions() {
        return this.prodList;
    }

    async handleSelectedPricebook(event){
        let pb = event.detail.value;
        console.log('pricebook ', pb);
        this.selectedPriceBook = pb;
        
        await getProductsFromPricebook({ 'pricebookId': pb })
            .then(result => {
                this.selectedProducts = result;
                console.log('selectedProducts', JSON.stringify(this.selectedProducts, null, 2));
                this.prodList = this.selectedProducts.map(item => {
                    return {
                        label: item.Product2.Name,
                        value: item.Product2.Name
                    };
                });
            });
    }
    

    saveRecord() {
        console.log('Selected Account ID:', this.selectedAccountId);
        console.log('Selected Contact ID:', this.selectedContactId);
        console.log('Close Date:', this.closeDate);
        console.log('Selected Pricebook ID:', this.selectedPriceBook);
        console.log('OLI List:', this.oliList);
        console.log('selectedProducts 11', JSON.stringify(this.selectedProducts, null, 2));
        
        createOpportunityAndOLIs({
            accountId: this.selectedAccountId,
            contactId: this.selectedContactId,
            closeDate: this.closeDate,
            pricebookId: this.selectedPriceBook,
            oliList: this.oliList,

        })
        .then(result => {
            console.log('Opportunity and OLIs created successfully:', result);
        })
        .catch(error => {
            console.error('Error creating opportunity and OLIs:', error);
        });
    }
    
}
