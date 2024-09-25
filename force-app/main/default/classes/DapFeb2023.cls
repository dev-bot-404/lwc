public with sharing class DapFeb2023 {

    @AuraEnabled
    public static List<Map<String, String>> getAccounts() {
        List<Map<String, String>> accounts = new List<Map<String, String>>();
        for (Account a : [SELECT Id, Name FROM Account]) {
            accounts.add(
                new Map<String, String>{ 'label' => a.Name, 'value' => a.Id }
            );
        }
        return accounts;
    }

    @AuraEnabled
    public static List<Contact> getContacts(String accId) {
        
        List<Contact> contacts = [SELECT Id, Name , Email , Phone ,AccountId FROM Contact Where AccountId = :accId];
        return contacts;
    }

    @AuraEnabled
    public static List<Pricebook2> getPricebook() {
        
        List<Pricebook2> pricebooks = [SELECT Id, Name FROM Pricebook2];
        return pricebooks;
    }



    @AuraEnabled
    public static List<PricebookEntry> getProductsFromPricebook(String pricebookId) {
        
        List<PricebookEntry> productsWithPrice = [SELECT  Product2.Name , Product2Id , UnitPrice ,Pricebook2Id FROM PricebookEntry Where Pricebook2Id = :pricebookId];
        return productsWithPrice;
    }


    @AuraEnabled
    public static void createOpportunityAndOLIs(String accountId, String contactId, String closeDate, String pricebookId, List<Map<String, Object>> oliList) {
        System.debug('accountId'+accountId);
        System.debug('contactId'+contactId);
        System.debug('closeDate'+closeDate);
        System.debug('pricebookId'+pricebookId);
        System.debug(oliList[0].get('PricebookEntryId'));
        Opportunity newOpportunity = new Opportunity(
            AccountId = accountId,
            CloseDate = Date.valueOf(closeDate),
            StageName = 'Prospecting', 
            ContactId = contactId,
            Pricebook2Id = pricebookId,
            Name = 'New Opportunity ' + Date.today()
        );

        insert newOpportunity;

        

        List<OpportunityLineItem> lineItems = new List<OpportunityLineItem>();
        for (Map<String, Object> oli : oliList) {
            Integer quant = Integer.valueOf(oli.get('Quantity'));
            Decimal uPrice = (Decimal)oli.get('UnitPrice');
            Decimal tPrice = (Decimal)oli.get('Total');
            String peId = (String)oli.get('PricebookEntryId');
            OpportunityLineItem lineItem = new OpportunityLineItem(
                OpportunityId = newOpportunity.Id,
                PricebookEntryId = peId,
                Quantity = quant,
                UnitPrice = uPrice
                
            );
            lineItems.add(lineItem);
        }

        insert lineItems;
    }


}