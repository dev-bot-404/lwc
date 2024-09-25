public with sharing class Session_Lwc_Fetch_Records {
    @AuraEnabled
    public static List<String> getPicklistValues(String fieldName) {

        Schema.DescribeFieldResult fieldResult = Opportunity.getSObjectType().getDescribe().fields.getMap().get(fieldName).getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        List<String> picklistValues = new List<String>();
        for (Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getValue());
        }
        return picklistValues;
    }

    @AuraEnabled
    public static Map<String, Object> getOpportunitiesByPicklistValueAndFieldSet(String picklistField, String picklistValue, String fieldSetName) {
        List<String> fieldSetFields = new List<String>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get('Opportunity').getDescribe().fields.getMap();
        
        List<Schema.FieldSetMember> fieldSetMembers = Schema.SObjectType.Opportunity.FieldSets.getMap().get(fieldSetName).getFields();
        for (Schema.FieldSetMember fsm : fieldSetMembers) {
            fieldSetFields.add(fsm.getFieldPath());
        }

        String query = 'SELECT Id, ' + String.join(fieldSetFields, ', ') + ' FROM Opportunity WHERE ' + picklistField + ' = \''+picklistValue+'\'';
        
        List<SObject> opportunities = Database.query(query);

        Map<String, Object> response = new Map<String, Object>();
        response.put('fields', fieldSetFields);
        response.put('opportunities', opportunities);

        return response;
    }
}
