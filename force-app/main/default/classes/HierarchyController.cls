public class HierarchyController {

    @AuraEnabled
    public static hierarchyWrapper getAllAccountHierarchy() {
        List<Account> accountList = [SELECT Id, Name, NumberOfEmployees, Phone, Owner.Name, BillingAddress, ParentId FROM Account];
        return getAllHierarchy(accountList, 'ParentId');
    }
    
    @AuraEnabled
    public static hierarchyWrapper getAllHierarchy(List<SObject> recordList, String parentFieldApiName) {
        Map<Id, List<SObject>> parentToChildrenMap = new Map<Id, List<SObject>>();
        List<SObject> parentList = new List<SObject>();
        
        for (SObject record : recordList) {
            Id parentFieldValue = (Id) record.get(parentFieldApiName);
            
            if (parentFieldValue != null) {
                if (parentToChildrenMap.containsKey(parentFieldValue)) {
                    parentToChildrenMap.get(parentFieldValue).add(record);
                } else {
                    parentToChildrenMap.put(parentFieldValue, new List<SObject>{record});
                }
            } else {
                parentList.add(record); // Accounts with no parent go to the root level
            }
        }
        
        hierarchyWrapper wrapper = new hierarchyWrapper();
        wrapper.superParentList = parentList;
        wrapper.parentMap = parentToChildrenMap;
        
        return wrapper;
    }
    
    public class hierarchyWrapper {
        @AuraEnabled public List<SObject> superParentList { get; set; }
        @AuraEnabled public Map<Id, List<SObject>> parentMap { get; set; }
    }
}
