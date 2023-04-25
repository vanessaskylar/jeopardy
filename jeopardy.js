// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let clueArray = [];
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS = 5;
const $loading = $('<div>').addClass('spinner')
    .html('<div class="text"><img src="jeopardy-logo.png"/></div><div class="loader"></div>');
const $header = $('<h1>').text('Jeopardy!');
const $table = $('<table>');
const $restart = $('<button>').addClass('restartBtn').text('RESTART');
$('body').append($loading, $header, $table, $restart)


/** Get NUM_CATEGORIES random category from API. Returns array of category ids */
async function getCategoryIds() {
    const response = await axios.get("http://jservice.io/api/categories", {
        params: {
            count: 100
        }
    });
    
    const randomCategories = _.sampleSize(response.data, NUM_CATEGORIES);

    let catId = [];
    for (let cat of randomCategories) {
        catId.push(cat.id); 
    }
    return catId;
}
/** Return object with data about a category:

 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {

    response = await axios.get('http://jservice.io/api/clues?category=' + catId);

    let question, answer, title;
    for (let i = 0; i < response.data.length; i++) {
        question = response.data[i].question;
        answer = response.data[i].answer;
        title = response.data[i].category.title;

        clueArray = _.sampleSize(clueArray, NUM_QUESTIONS);
        clueArray.push({ question, answer, showing: null});
    }
    return {title, clueArray};
};

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $table.empty();

    const $thead = $('<thead>');
    const $theadTr = $('<tr>');

    categories.forEach(async function (cat) {
        const $th = $('<th>').text(cat.title);
        $theadTr.append($th);
    });
    $thead.append($theadTr);
    $table.append($thead);

    const $tbody = $('<tbody>');
    for (let clueIndex = 0; clueIndex < NUM_QUESTIONS; clueIndex++) {
        const $tr = $('<tr>');
        for (let catIndex = 0; catIndex < NUM_CATEGORIES; catIndex++) {
            const $td = $('<td>').attr({
                id: `${catIndex}-${clueIndex}`,
                category: catIndex,
                clue: clueIndex,
            })
            .html('<span>?</span>');
            $tr.append($td);
        }
        $tbody.append($tr);
    }
    $table.append($tbody);

    hideLoadingView();

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const $this = $(this);
    if ($this.hasClass('answered')) {
        return;
    }
    const id = this.id;
    let [catIndex, clueIndex] = id.split('-');
    console.log('catIndex:', catIndex, 'clueIndex:', clueIndex);
    console.log('categories:', categories)

    let clue = categories[catIndex].clueArray[clueIndex];
    console.log('clue:', clue)

    if(clue.showing === null) {
        $this.html(clue.question);
        $this.addClass = 'question';
        clue.showing = 'question';
    } else if (clue.showing === 'question') {
        $this.html(clue.answer);
        clue.showing = 'answer';
        $this.removeClass('question');
        $this.addClass('answered');
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $loading.fadeIn();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    setTimeout(() => {
        $loading.fadeOut('slow');
    }, 1500)
}


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    showLoadingView();

    const catId = await getCategoryIds();

    categories = [];
    for (let id of catId) {
        categories.push(await getCategory(id))
    }

    fillTable();
}


/** On click of start / restart button, set up game. */
// restart.addEventListener('click', function () {
//     location.reload();
// })
$($restart).click(function () {
    setupAndStart();
});


/** On page load, add event handler for clicking clues */
$(document).ready(function () {
    setupAndStart() 
    $('table').on('click', 'td', handleClick);
});