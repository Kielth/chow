import React from "react";
import { Link } from "react-router-dom";
import { pluralize, idbPromise } from "../../../utils/helpers"
import { useStoreContext } from "../../../utils/shopping/GlobalState";
import { UPDATE_RESCUE } from "../../../utils/shopping/actions";

function RescueItem(thisRescue) {
  const [state, dispatch] = useStoreContext();

  const {
    name,
    _id,
    website,
  } = thisRescue;

  const { rescue } = state;

  function assignRescue() {
    // assign selected rescue to state.rescue
    idbPromise('rescue', 'put', thisRescue);
  }

  return(
    <div className="card px-1 py-1">
        <p>{name}</p>
        <p>webesite: {website}</p> 
        <button onClick={assignRescue}>Choose {thisRescue.name}</button><br></br>
    </div>
  );

}

export default RescueItem;
