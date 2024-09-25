public with sharing class DapPracticePaper1_OwnerChange {
    @AuraEnabled
    public static List<sObject> getRecordsOfSelectedObject(String objName){
        try {
            if(objName == 'Case'){
                String fetchRecords = 'SELECT Id, CaseNumber, OwnerId ,Owner.Name From '+ objName + ' Order by CreatedDate Desc Limit 20' ;
                List<sObject> records = Database.query(fetchRecords);
                return records;
            }else{
                String fetchRecords = 'SELECT Id, Name, OwnerId ,Owner.Name From '+ objName + ' Order by CreatedDate Desc Limit 20' ;
                List<sObject> records = Database.query(fetchRecords);
                return records;
            }
                        
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getUserList() {
        return [SELECT Name, Id, Email, Username FROM User];
    }

    @AuraEnabled
    public static void changeOwner(Id userIdToAssign , String recordData , String objectName){
        try {
            System.debug(userIdToAssign);
            System.debug(recordData);   
            ID userId = userIdToAssign; 
            Object obj = JSON.deserializeUntyped(recordData);
        
            List<Object> dataList = (List<Object>) obj;
            
            Map<String, Map<String, Object>> resultMap = new Map<String, Map<String, Object>>();
            
            for (Object o : dataList) {
                Map<String, Object> data = (Map<String, Object>) o;
                String id = (String) data.get('Id');
                resultMap.put(id, data);
            }
            List<sObject> recToUpdate = new List<sObject>();
            
            Set<Id> recToChangeIds = new Set<Id>();
            for(String s : resultMap.keySet()){
                recToChangeIds.add((ID) s);
            }
            if(objectName == 'Case'){
                String fetchRecords = 'SELECT Id, CaseNumber, OwnerId ,Owner.Name From '+ objectName;
                List<Case> records = Database.query(fetchRecords);
                for(Case rec : records){
                    if(recToChangeIds.contains(rec.Id)){
                        rec.OwnerId = (ID) userId;
                        recToUpdate.add(rec);
                    }
                }
            }else{
                String fetchRecords = 'SELECT Id, Name, OwnerId ,Owner.Name From '+ objectName;
                if(objectName == 'Account'){
                    List<Account> records = Database.query(fetchRecords);
                    for(Account rec : records){
                        if(recToChangeIds.contains(rec.Id)){
                            rec.OwnerId = (ID) userId;
                            recToUpdate.add(rec);
                        }
                    }
                }
                if(objectName == 'Contact'){
                    List<Contact> records = Database.query(fetchRecords);
                    for(Contact rec : records){
                        if(recToChangeIds.contains(rec.Id)){
                            rec.OwnerId = (ID) userId;
                            recToUpdate.add(rec);
                        }
                    }
                }
                if(objectName == 'Opportunity'){
                    List<Opportunity> records = Database.query(fetchRecords);
                    for(Opportunity rec : records){
                        if(recToChangeIds.contains(rec.Id)){
                            rec.OwnerId = (ID) userId;
                            recToUpdate.add(rec);
                        }
                    }
                }
                if(objectName == 'Lead'){
                    List<Lead> records = Database.query(fetchRecords);
                    for(Lead rec : records){
                        if(recToChangeIds.contains(rec.Id)){
                            rec.OwnerId = (ID) userId;
                            recToUpdate.add(rec);
                        }
                    }
                }
                
            }
            System.debug('** '+resultMap);
            System.debug('++ '+recToUpdate);
            Update recToUpdate;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}