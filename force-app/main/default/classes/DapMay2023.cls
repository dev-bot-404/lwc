public with sharing class DapMay2023 {
    @AuraEnabled
    public static List<Contact> fetchContacts(String search){
        try {
            if(search == Null){
                return [Select Id , Name , Email , Phone , AccountId From Contact  ];
            }else{
                String searchWithWildcard =  '%'+search+'%' ;
                return [Select Id , Name , Email , Phone ,AccountId From Contact Where Name Like : searchWithWildcard ];
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void assignAccountToContact(List<String> conListToCreateAccount , String acId){
        try {
           
			
            System.debug(' dataList--'+conListToCreateAccount);
            
            Set<Id> conIds = new Set<Id>();
            for (String c : conListToCreateAccount) {
                conIds.add(c);
            }
            List<Contact> conList = [Select Id From Contact Where Id IN :conIds];

            for(Contact c : conList){
                c.AccountId = acId;
            }

            update conList;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}