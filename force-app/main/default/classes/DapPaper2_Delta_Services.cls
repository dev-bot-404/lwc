public with sharing class DapPaper2_Delta_Services {
    @AuraEnabled(Cacheable = true)
    public static List<Opportunity> getOpp(String stage_name){
        System.debug(stage_name);
        if (stage_name == 'All') {
            System.debug([Select Id , Name , StageName , Probability , Amount From Opportunity Limit 20]);
            return [Select Id , Name , StageName , Probability , Amount From Opportunity Limit 50];
            
        }else {
            System.debug([Select Id , Name , StageName , Probability , Amount From Opportunity Where StageName = :stage_name Limit 20]);
            return [Select Id , Name , StageName , Probability , Amount From Opportunity Where StageName = :stage_name Limit 50];
        }
        
        
    }
}