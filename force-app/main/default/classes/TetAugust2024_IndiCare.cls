public with sharing class TetAugust2024_IndiCare {
    
    @AuraEnabled
    public static Map<String,String> getContactFieldSetFields(){
        try {
            
            Map<String, String> fieldsetFields = new Map<String, String>();

            Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
            System.debug('GlobalDescribeMap: ' + GlobalDescribeMap);

            Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get('Contact');
            System.debug('SObjectTypeObj: ' + SObjectTypeObj);

            Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();
            System.debug('DescribeSObjectResultObj: ' + DescribeSObjectResultObj);

            // Retrieve the field set using Schema.FieldSet
            Schema.FieldSet fieldSetObj = DescribeSObjectResultObj.fieldSets.getMap().get('Tet_August_2024_Contact');
            System.debug('FieldSetObj: ' + fieldSetObj);

            if (fieldSetObj != null) {
                for (Schema.FieldSetMember fieldSetMemberObj : fieldSetObj.getFields()) {
                    System.debug('API Name ====> ' + fieldSetMemberObj.getFieldPath()); // API name
                    System.debug('Label ====> ' + fieldSetMemberObj.getLabel()); // Field label
                    fieldsetFields.put(fieldSetMemberObj.getFieldPath() , fieldSetMemberObj.getLabel());
                }
            }

            return fieldsetFields;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String,String> getOpportunityFieldSetFields(){
        try {
            Map<String, String> fieldsetFields = new Map<String, String>();

            Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
            System.debug('GlobalDescribeMap: ' + GlobalDescribeMap);

            Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get('Opportunity');
            System.debug('SObjectTypeObj: ' + SObjectTypeObj);

            Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();
            System.debug('DescribeSObjectResultObj: ' + DescribeSObjectResultObj);

            // Retrieve the field set using Schema.FieldSet
            Schema.FieldSet fieldSetObj = DescribeSObjectResultObj.fieldSets.getMap().get('Tet_August_2024_Opportunity');
            System.debug('FieldSetObj: ' + fieldSetObj);

            if (fieldSetObj != null) {
                for (Schema.FieldSetMember fieldSetMemberObj : fieldSetObj.getFields()) {
                    System.debug('API Name ====> ' + fieldSetMemberObj.getFieldPath()); // API name
                    System.debug('Label ====> ' + fieldSetMemberObj.getLabel()); // Field label
                    fieldsetFields.put(fieldSetMemberObj.getFieldPath() , fieldSetMemberObj.getLabel());
                }
            }

            return fieldsetFields;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled
    public static List<sObject> getRecords(Id recId,String ldSource ,String stage , String tab){
        try {

            if(tab == 'Contact'){

                Schema.FieldSet fieldSetObj = Schema.getGlobalDescribe().get('Contact').getDescribe().fieldSets.getMap().get('Tet_August_2024_Contact');

                String query = 'SELECT ';
                for (Schema.FieldSetMember fieldSetMemberObj : fieldSetObj.getFields()) {
                        System.debug('API Name ====> ' + fieldSetMemberObj.getFieldPath()); 
                        query += fieldSetMemberObj.getFieldPath() + ', ';
                }
                query = query.removeEnd(', ') + ' FROM Contact Where AccountId = \'' +recId+'\' And LeadSource = \''+ldSource+'\'';

                List<sObject> records = Database.query(query);

                return records;
            }
            else{
                if(stage == 'All'){
                    Schema.FieldSet fieldSetObj = Schema.getGlobalDescribe().get('Opportunity').getDescribe().fieldSets.getMap().get('Tet_August_2024_Opportunity');

                    String query = 'SELECT ';
                    for (Schema.FieldSetMember fieldSetMemberObj : fieldSetObj.getFields()) {
                            System.debug('API Name ====> ' + fieldSetMemberObj.getFieldPath()); 
                            query += fieldSetMemberObj.getFieldPath() + ', ';
                    }
                    query = query.removeEnd(', ') + ' FROM Opportunity Where AccountId = \'' +recId+'\'';

                    List<sObject> records = Database.query(query);

                    return records;

                }
                else {
                    Schema.FieldSet fieldSetObj = Schema.getGlobalDescribe().get('Opportunity').getDescribe().fieldSets.getMap().get('Tet_August_2024_Opportunity');

                    String query = 'SELECT ';
                    for (Schema.FieldSetMember fieldSetMemberObj : fieldSetObj.getFields()) {
                            System.debug('API Name ====> ' + fieldSetMemberObj.getFieldPath()); 
                            query += fieldSetMemberObj.getFieldPath() + ', ';
                    }
                    query = query.removeEnd(', ') + ' FROM Opportunity Where AccountId = \'' +recId+'\' And StageName = \''+stage+'\'';

                    List<sObject> records = Database.query(query);

                    return records;
                }
                
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}