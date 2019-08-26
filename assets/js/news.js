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

//Handle Unsave Article button
$(document).on("click","#UnsaveBtn", function() {
    console.log("UNsaved Button Clicked")
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/Unsaved/" + thisId
    }).done(function(data) {
        console.log(data)
        window.location.reload();
    })
});

//Handle Add/View Note Button
$(document).on("click",".addViewNote", function() {
    console.log("Add/View Button Clicked")
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).done(function(data) {
        console.log(data)
    })
});

//Handle Delete Article button
$(document).on("click","#deleteArtBtn", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/deleteArticle/" + thisId
    }).done(function(data) {
        console.log(data)
        window.location.reload();
    })
});

//Handle Save Note button
$(document).on("click","#saveNote", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/savedNote/" + thisId,
            data: {
              body: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              window.location.reload();
              $(".modalNote").modal("hide");
          });
    }
});

//Handle Delete Note button
$("#deleteNote").on("click", function() {
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