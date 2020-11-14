export const dateToNiceString = (myDate) => {
    myDate = new Date(myDate);
    const month=new Array();
    month[0]="Jan";
    month[1]="Feb";
    month[2]="Mar";
    month[3]="Apr";
    month[4]="May";
    month[5]="Jun";
    month[6]="Jul";
    month[7]="Aug";
    month[8]="Sep";
    month[9]="Oct";
    month[10]="Nov";
    month[11]="Dec";
    // const hours = myDate.getHours();
    // const minutes = myDate.getMinutes();
    return month[myDate.getMonth()]+" "+myDate.getDate()+", "+myDate.getFullYear();
};

export const dateToUnix = (dateString) => {
    return new Date(dateString).getTime();
}