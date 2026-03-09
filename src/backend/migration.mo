import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  public type Note = {
    id : Text;
    owner : Principal;
    title : Text;
    subject : Text;
    classLevel : Text;
    description : ?Text;
    file : ?Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  public type OldActor = {
    notes : Map.Map<Text, Note>;
    nextNoteId : Nat;
  };

  public type NewActor = {
    notes : Map.Map<Text, Note>;
    nextNoteId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      notes = old.notes;
      nextNoteId = old.nextNoteId;
    };
  };
};
