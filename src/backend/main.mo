import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Access control state for user roles
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Note = {
    id : Text;
    owner : Principal;
    title : Text;
    subject : Text;
    classLevel : Text;
    description : ?Text;
    file : ?Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  module Note {
    public func compareByTime(note1 : Note, note2 : Note) : Order.Order {
      if (note1.createdAt < note2.createdAt) {
        #greater;
      } else if (note1.createdAt > note2.createdAt) {
        #less;
      } else {
        #equal;
      };
    };
  };

  let notes = Map.empty<Text, Note>();
  var nextNoteId = 0;

  public shared ({ caller }) func createNote(title : Text, subject : Text, classLevel : Text, description : ?Text, file : ?Storage.ExternalBlob) : async Text {
    let noteId = nextNoteId.toText();
    let note : Note = {
      id = noteId;
      owner = caller;
      title;
      subject;
      classLevel;
      description;
      file;
      createdAt = Time.now();
    };

    notes.add(noteId, note);
    nextNoteId += 1;
    noteId;
  };

  public query ({ caller }) func getNote(id : Text) : async Note {
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };
  };

  public shared ({ caller }) func updateNote(id : Text, title : Text, subject : Text, classLevel : Text, description : ?Text, file : ?Storage.ExternalBlob) : async () {
    let note = switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };

    if (note.owner != caller) {
      Runtime.trap("Unauthorized: Only the owner can update this note");
    };

    let updatedNote : Note = {
      id = note.id;
      owner = note.owner;
      title;
      subject;
      classLevel;
      description;
      file;
      createdAt = note.createdAt;
    };

    notes.add(id, updatedNote);
  };

  public shared ({ caller }) func deleteNote(id : Text) : async () {
    let note = switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };

    if (note.owner != caller) {
      Runtime.trap("Unauthorized: Only the owner can delete this note");
    };

    notes.remove(id);
  };

  public query ({ caller }) func getAllNotes(subjectFilter : ?Text, classLevelFilter : ?Text) : async [Note] {
    let allNotes = notes.values().toArray();

    let filteredNotes = allNotes.filter(
      func(note) {
        let subjectMatches = switch (subjectFilter) {
          case (null) { true };
          case (?subject) { note.subject.contains(#text subject) };
        };

        let classLevelMatches = switch (classLevelFilter) {
          case (null) { true };
          case (?classLevel) { note.classLevel.contains(#text classLevel) };
        };

        subjectMatches and classLevelMatches
      }
    );

    filteredNotes.sort(Note.compareByTime);
  };

  public query ({ caller }) func getUserNotes() : async [Note] {
    let userNotes = notes.values().toArray().filter(
      func(note) { note.owner == caller }
    );

    userNotes.sort(Note.compareByTime);
  };

  public query ({ caller }) func searchNotes(keyword : Text) : async [Note] {
    let keywordLower = keyword.toLower();
    let results = notes.values().toArray().filter(
      func(note) {
        note.title.toLower().contains(#text keywordLower) or note.subject.toLower().contains(#text keywordLower)
      }
    );
    results.sort(Note.compareByTime);
  };
};
