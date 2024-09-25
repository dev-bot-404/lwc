public with sharing class DapJune2023ShoppingCart {
    @AuraEnabled(cacheable = true)
    public static List<PricebookEntry> getProducts(){
        try {

            //List<Product2> productList = [SELECT Id , Name , Description , DisplayUrl , (SELECT Id , Name ,UnitPrice FROM PricebookEntries) From Product2 WHERE IsActive = true And DisplayUrl != Null] ;
            List<PricebookEntry> productList = [SELECT Id, Pricebook2Id , Product2Id ,Product2.Name ,Product2.DisplayUrl ,Product2.Description , UnitPrice , Name , IsActive FROM  PricebookEntry Where Product2.DisplayUrl != Null AND IsActive = true ];
            return productList;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    
        @AuraEnabled
        public static void createOpportunityWithProducts(String opportunityName, List<Map<String, Object>> products) {
            try {
                Opportunity opp = new Opportunity();
                opp.Name = opportunityName;
                opp.StageName = 'Prospecting';
                opp.CloseDate = Date.today().addDays(30); 
                insert opp;
    
                List<OpportunityLineItem> oppLineItems = new List<OpportunityLineItem>();
    
                for (Map<String, Object> product : products) {
                    String pricebookEntryId = (String) product.get('Id');
                    Decimal unitPrice = (Decimal)(product.get('UnitPrice'));
                    Integer quantity = Integer.valueOf(product.get('Quantity'));
    
                    OpportunityLineItem oli = new OpportunityLineItem();
                    oli.OpportunityId = opp.Id;
                    oli.PricebookEntryId = pricebookEntryId; 
                    oli.Quantity = quantity;
                    oli.UnitPrice = unitPrice;
                    
                    oppLineItems.add(oli);
                }
    
                if (!oppLineItems.isEmpty()) {
                    insert oppLineItems;
                }
    
            } catch (Exception ex) {
                throw new AuraHandledException('Error creating opportunity: ' + ex.getMessage());
            }
        }
    
}