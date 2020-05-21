# Salesforce bulk import

## Parameters

entity: Salesforce target object identified by its API name.

extIdField: its mandatory for operation updating existing elements like update or upsert. The field provided need to be an External ID, Salesforce Id, or indexed field for the target object.

Example of the transformation specification csv file:

```
Salesforce Field,Csv Header,Value,Hint\n
aaa,aaa,,\n
```
