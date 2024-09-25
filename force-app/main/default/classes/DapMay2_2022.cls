public with sharing class DapMay2_2022 {
    @AuraEnabled(cacheable = true)
    public static list<Account> getdata(){
        
        return [SELECT Id, Name, (SELECT Id, Name FROM Opportunities), (SELECT Id, Name FROM Contacts) FROM Account];
        
    }

}