public with sharing class RecordsClass {
    @AuraEnabled
    public static List<Contact> records(String searchName) {
        list<Contact> con = [Select Id,Name,Email,Phone From Contact Where Email Like :searchName+'%'];//we add percent because if only one character add then records start from that char comes
        return con;
    }


    @AuraEnabled
    public static Integer sendEmail(String mailaddress){
        Integer randomNumber = Integer.valueof(Math.random()*1000 +1000) ;

        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        String[] toAddresses = new String[] {mailaddress};

        mail.setToAddresses(toAddresses);

        mail.setSubject('OTP');

        mail.setHtmlBody('<h1>'+ 'OTP => ' + randomNumber  + '</h1>');

        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

        return randomNumber;

    }
}