public class FieldSetController {
    @AuraEnabled(cacheable=true)
    public static List<Account> fetchAccountFieldSetData(){
        String queryString = 'SELECT Id';
        List<Account> accList = new List<Account>();
        for(Schema.FieldSetMember fld :SObjectType.Account.FieldSets.accountFieldSet.getFields()) {
            queryString += ', ' + fld.getFieldPath();
        }
        queryString += ' FROM Account LIMIT 10';
         
        acclist = Database.query(queryString);
        return acclist;
    }
    @AuraEnabled(cacheable=true)
    public static String getFieldSet(String sObjectName, String fieldSetName) {
        String result = '';
        try{
            SObjectType objToken = Schema.getGlobalDescribe().get(sObjectName);
            Schema.DescribeSObjectResult d = objToken.getDescribe();
            Map<String, Schema.FieldSet> fieldSetMap = d.fieldSets.getMap();
            if(fieldSetMap.containsKey(fieldSetName)){
                for(Schema.FieldSetMember f : fieldSetMap.get(fieldSetName).getFields()) {
                     
                    if(String.isNotBlank(result)){
                        result += ',';
                    }
                    String jsonPart = '{';
                    jsonPart += '"required":"' + (f.getDBRequired() || f.getRequired()) + '",';
                    jsonPart += '"type":"' + (f.getType()) + '",';
                    jsonPart += '"label":"' + (f.getLabel()) + '",';
                    jsonPart += '"name":"' + f.getFieldPath() + '"';
                    jsonPart += '}';
                    result += jsonPart;
                }
            }
        }
        catch(Exception ex){
            result += ex.getLineNumber() + ' : ' + ex.getMessage();
        }
        return '['+result+']';
    }
}