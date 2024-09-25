public with sharing class Dap27June2024_platform_event {
    @AuraEnabled(cacheable = true)
    public static List<PricebookEntry> getProducts(String recId ){
        List<PricebookEntry> productDetails=new List<PricebookEntry>();
        try {

            Opportunity opp = [SELECT Id, Name, AccountId , Account.Industry , Account.AnnualRevenue FROM Opportunity Where Id = :recId ];
            String industry = opp.Account.Industry;
            Decimal  budget = opp.Account.AnnualRevenue;

            productDetails = [SELECT Id, Product2.Name, Product2.Industry__c, Product2.Description, IsActive, UnitPrice, Pricebook2.Name FROM PricebookEntry Where IsActive = true AND Product2.Industry__c = :industry AND UnitPrice <= :budget AND Pricebook2.Name = 'Standard Price Book' ];

            
        } catch (Exception e) {
            
            system.debug(e.getMessage());
        }
        return productDetails;
   
    }

    @AuraEnabled
    public static void createOli(String recId , Map<String, Object> product , String accId){
        try {
            List<OpportunityLineItem> oppLineItems = new List<OpportunityLineItem>();
            System.debug('recId'+recId);
            String pricebookEntryId = (String) product.get('Id');
            System.debug('pricebookEntryId'+pricebookEntryId);
            Decimal unitPrice = (Decimal)(product.get('UnitPrice'));
            System.debug('unitPrice'+unitPrice);

            OpportunityLineItem oli = new OpportunityLineItem();
            oli.OpportunityId = recId;
            oli.PricebookEntryId = pricebookEntryId; 
            oli.Quantity = 1;
            oli.UnitPrice = unitPrice;
            
            System.debug('oli'+oli);
            oppLineItems.add(oli);
                
    
            if (!oppLineItems.isEmpty()) {
                insert oppLineItems;
            }

            System.debug(accId);
            Account ac = [Select Id , AnnualRevenue From Account Where Id = :accId];
            System.debug(ac);
            ac.AnnualRevenue = (Decimal)ac.AnnualRevenue - (Decimal)unitPrice;
            System.debug(ac);
            update ac;
            System.debug('update');
        } catch (Exception e) {
            system.debug(e.getMessage());
        }
    }

}