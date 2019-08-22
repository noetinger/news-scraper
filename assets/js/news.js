//Handle Scrape button
$(document).on("click", "#scrape",function() {
    console.log("Article Scrape Button Pressed")
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        window.location.reload();
    })
});

//Handle Save Article button
$(document).on("click","#saveBtn", function() {
    console.log("Saved Button Clicked")
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/saved/" + thisId
    }).done(function(data) {
        console.log(data)
    })
});

//Handle Delete Article button
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/delete/" + thisId
    }).done(function(data) {
        console.log(data)
    })
});

//Handle Save Note button
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/savedNote" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
          });
    }
});

//Handle Delete Note button
$(".deleteNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function(data) {
        console.log(data)
        $(".modalNote").modal("hide");
    })
});