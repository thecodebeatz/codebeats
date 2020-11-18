/**
 * @function dateToNiceString
 * Converts date timestamp to format Mon DD, YYYY
 *  
 * @param {string} myDate a string representing a timestamp.
 * @returns {string} A string representation of the date following the format Mon DD, YYYY (e.g. Jan 1, 2021)
 */
export const dateToNiceString = (myDate) => {
    myDate = new Date(myDate);
    const month=[];
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

/**
 * @function dateToUnix
 * Converts date timestamp to Unix format
 *  
 * @param {string} dateString a string representing a timestamp.
 * @returns {number} Unix time representation of the provided timestamp
 */
export const dateToUnix = (dateString) => {
    return new Date(dateString).getTime();
}
