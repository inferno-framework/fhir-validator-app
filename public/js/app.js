$(function() {
  // var profiles = new Bloodhound({
  //   datumTokenizer: Bloodhound.tokenizers.whitespace,
  //   queryTokenizer: Bloodhound.tokenizers.whitespace,
  //   prefetch: {
  //     url: '/profiles',
  //     cache: false
  //   }
  // });

  // $(".typeahead").typeahead(null, {
  //   name: 'profiles',
  //   source: profiles
  // });

  // This gets triggered when a user adds or removes a file object from the file input field.
  $(".custom-file-input").on("load change", function () {
    var fileName = $(this).val().split("\\").pop();

    // If fileName has characters, that means we're adding a file
    // If it doesn't, we're removing a file
    if (fileName.length > 0) {
      $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
      $(this).closest(".jumbotron").find(".disable-me").val('').attr('disabled', true).addClass('disabled');
    } else {
      $(this).siblings(".custom-file-label").removeClass("selected").html('Or upload a file:');
      $(this).closest(".jumbotron").find(".disable-me").attr('disabled', false).removeClass('disabled');
    }
  });
  
  $(".custom-text-area").on("input", function() {
    if ($(this).val().length > 0) {
      $(this).closest('.jumbotron').find('.disable-me-textarea').val('').attr('disabled', true).addClass('disabled');
    } else {
      $(this).closest('.jumbotron').find('.disable-me-textarea').attr('disabled', false).removeClass('disabled');
    }
  });

  $(".custom-input").on("input", function () {
    console.log('foo');
    if ($(this).val().length > 0) {
      $(this).closest('.jumbotron').find('.disable-me-input').val('').attr('disabled', true).addClass('disabled');
    } else {
      $(this).closest('.jumbotron').find('.disable-me-input').attr('disabled', false).removeClass('disabled');
    }
  });
});
