public with sharing class TET_23August2024_CloudSales {
    
    @AuraEnabled(Cacheable = true)
    public static List<Account> getAccounts(){
        try {
            return [SELECT Name From Account LIMIT 10 OFFSET 20];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Opportunity> getAssociatedOpportunites(String accName){
        try {
            return [SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity Where Account.Name = :accName];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}