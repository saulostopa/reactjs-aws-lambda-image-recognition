let words         = require('./textDetected.json')
let makeAndtype   = require('./makeAndType.json')
let states        = require('./../states.json')

/**
 * /^       => start string
 * ()       => whole content
 * [A-Z0-9] => digits and leters only uppercase 
 * {17}     => size 17 characters
 * $/       => end of content
 * g        => The g means Global, and causes the replace call to replace all matches, not just the first one
 */
const regexVin = new RegExp(/^([A-Z0-9]{17})$|^([A-Z0-9]{17})-\d{4}$/gi) // 1UYVS2534AU095513 (17 letters with uppercase characters) | 1UYVS2534AU095513-2021 (17 letters with uppercase characters and year


/**
 * /^               => start string
 * |                => OR operator for multiple patterns:
 *                      => Pattern 1: (DD/MM/YYYY):  "11/25/2016"
 *                      => Pattern 2: (DD/MM/YY):    "11/25/22"
 *                      => Pattern 3: (DD-MM-YY):    "11-25-22"
 *                      => Pattern 4: (DD-MMM-YYYY): "11-Feb-2022" OR "11-FEB-2022"
 * \d{2}            => Month with 2 digits
 * ()               => whole content of month
 * (?:Jan|Feb|...   => Any month
 * \d{4}            => Year with 4 digits
 * $/               => end of content
 * g                => The g means Global, and causes the replace call to replace all matches, not just the first one
 * i                => The i means upper and lower case are ignored
 */
const regexExpDate = new RegExp(/^\d{2}\/\d{2}\/\d{4}$|^\d{2}\/\d{2}\/\d{2}$|^\d{2}-\d{2}-\d{2}|^\d{2}-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/gi);


/**
 * /^                       => start string
 * ()                       => whole content
 * (?:Alabama|Alaska|...    => Any state with full name
 * * (?:AL|AK|...           => Any state with acronym name
 * $/                       => end of content
 * g                        => The g means Global, and causes the replace call to replace all matches, not just the first one
 * i                        => The i means upper and lower case are ignored
 */
const regexStateFull  = new RegExp(/^(?:Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)$/gi);
const regexStateShort = new RegExp(/^(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|GEORGIA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)$/gi);


/**
 * /^           => start string
 * ()           => whole content
 * [19[5-9]\d]  => Year starts in 1950 and ends in 1999
 * [20[0-9]\d]  => Year starts in 2000 and ends in 2099
 * $/           => end of content
 * g            => The g means Global, and causes the replace call to replace all matches, not just the first one
 */
 const regexYearFull  = new RegExp(/^(195\d|20[0-9]\d)$/g);
 

/**
 * To find model of vehicle, we need to use NHTSA.dot.gov API sending VIN and modelyear:
 * https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/1UYVS2534AU095513?format=json&modelyear=2010
 */


let dataVIN            = []
let dateExp            = []
let dataState          = []
let dataYear           = []
let dataMake           = []
let dataType           = []

const getVIN           = setVIN(words)
const getDateExp       = setDateExp(words)
const getState         = setState(words)
const getYear          = setYear(words)
const getMake          = setMake(makeAndtype)
const getType          = setType(makeAndtype)

function setVIN(words) {
    for (let i = 0; i < words.length; i++) {
        const regexResult = words[i]['TEXT'].match(regexVin)   // extract vehicle identification number with regex
        if (regexResult != null && regexResult.length == 17) { // VIN Recognized with 1UYVS2534AU095513
            dataVIN = regexResult
        } else if (regexResult != null) {
            dataVIN  = regexResult[0].split('-')[0] // 1UYVS2534AU095513-2021 => VIN + YEAR Recognized = 1UYVS2534AU095513
            dataYear = regexResult[0].split('-')[1] // 1UYVS2534AU095513-2021 => VIN + YEAR Recognized = 2021
        }
    }
    return dataVIN;
}

function setDateExp(words) {
    for (let i = 0; i < words.length; i++) {
        const setResultExp = words[i]['TEXT'].match(regexExpDate); // extract date of expiration with regex
        if (setResultExp != null && !setResultExp.includes(setResultExp)) { // check if already exist and is not empty
            dateExp.push(setResultExp)
        }
    }

    if (dateExp.length > 0) {
        const maxDate = new Date(
            Math.max(
              ...dateExp.map(element => {
                return new Date(element[0]) // get max date of expiration removing duplicates
              }),
            ),
        );
        return (maxDate.getMonth() + 1).toString().padStart(2, "0") + '/' + maxDate.getDate().toString().padStart(2, "0") + '/' +  maxDate.getFullYear(); // format to MM/DD/YYYY
    } else {
        return null;
    }
}

function setState(words) {
    for (let i = 0; i < words.length; i++) {
        const setResultStateFull  = words[i]['TEXT'].match(regexStateFull)  // GEORGIA
        const setResultStateShort = words[i]['TEXT'].match(regexStateShort) // GA

        states.filter(function(el) { // compare states check lowercase and upper case
            if ( setResultStateFull != null && setResultStateFull.map(element => element.toLowerCase()) == el.full_name.toLowerCase() ) {
                dataState.push(el.short_name);
            } else if ( setResultStateShort != null && setResultStateShort.map(element => element.toLowerCase()) == el.short_name.toLowerCase() ) {
                dataState.push(el.short_name);
            }
        })
    }
    let uniq = {};
    return dataState.filter(obj => !uniq[obj.id] && (uniq[obj.id] = true)) // Remove duplicates
}

function setYear(words) {
    if (dataYear != null && dataYear.length < 1) { // check if year already was recognized in setVIN()
        for (let i = 0; i < words.length; i++) {
            const setResultYearFull  = words[i]['TEXT'].match(regexYearFull)
            if ( setResultYearFull != null ) {
                dataYear.push(setResultYearFull[0]);
            }
        }
        let uniq = {};
        return dataYear.filter(obj => !uniq[obj.id] && (uniq[obj.id] = true)) // Remove duplicates
    } else {
        return dataYear; // get year from VIN if pattern recognized as 1UYVS2534AU095513-2021 => VIN + YEAR
    }
}

function setMake(makeAndtype) {
    if ( Object.keys(makeAndtype).length > 0 ) {
        const setResultMake = makeAndtype.Results.map(
            object => object.Variable === 'Make' ? dataMake.push(object.Value) : null
        );
    }
    return dataMake;
}

function setType(makeAndtype) {
    if ( Object.keys(makeAndtype).length > 0 ) {
        const setResultType = makeAndtype.Results.map(
            object => object.Variable === 'Vehicle Type' ? dataType.push(object.Value) : null
        );
    }
    return dataType;
}

let data = {
    ...{getVIN},
    ...{getDateExp},
    ...{getState},
    ...{getYear},
    ...{getMake},
    ...{getType},
};

console.log('data',data); // true