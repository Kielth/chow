import React, { useEffect } from 'react';
import { useStoreContext } from '../../../utils/shopping/GlobalState';
import { UPDATE_RESCUES } from '../../../utils/shopping/actions';
import { useQuery } from '@apollo/client';
import { QUERY_RESCUES } from '../../../utils/shopping/queries';
import { idbPromise } from '../../../utils/helpers';
import spinner from '../../../assets/spinner.gif';
import RescueItem from '../RescueItem';

function RescueSelector () {
    
    const [state, dispatch] = useStoreContext();
    const { loading, data } = useQuery(QUERY_RESCUES);

    useEffect(() => {
        
        if (data) {
          dispatch({
            type: UPDATE_RESCUES,
            rescues: data.rescues,
          });

          data.rescues.forEach((thisRescue) => {
            idbPromise('rescues', 'put', thisRescue);
          });
        } 
        else if (!loading) {
          idbPromise('rescues', 'get').then((thisRescues) => {
            dispatch({
                type: UPDATE_RESCUES,
                rescues: thisRescues,
            });
          });

        }
      }, [data, loading, dispatch]);
    
      function getRescues () {
        
        return state.rescues;
      }

    return (
        <div className="my-2">
            <h2>RESCUES:</h2>
            {state.rescues.length ? (
                <div className="flex-row">
                {getRescues().map((rescue) => (
                    <RescueItem
                    key={rescue._id}
                    _id={rescue._id}
                    name={rescue.name}
                    website={rescue.website}
                    />
                ))}
                </div>
            ) : (
                <h3>You haven't added any recues yet!</h3>
            )}
            {loading ? <img src={spinner} alt="loading" /> : null}
        </div>
    );
}

export default RescueSelector;
