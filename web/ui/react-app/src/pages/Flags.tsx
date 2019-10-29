import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Alert, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Flags: FC<RouteComponentProps> = () => {
  const [flags, setFlags] = useState<{ [key: string]: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('../api/v1/status/flags')
      .then(res => res.json())
      .then(res => setFlags(res.data))
      .catch(error => setError(error.message));
  }, []);

  const body = (error: string, flags: { [key: string]: any } | null) => {
    if (error) {
      return (
        <Alert color="danger">
          <strong>Error:</strong> Error fetching flags: {error}
        </Alert>
      );
    } else if (flags) {
      return (
        <Table bordered={true} size="sm" striped={true}>
          <tbody>
            {Object.keys(flags).map(key => {
              return (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{flags[key]}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      );
    }
    return <FontAwesomeIcon icon={faSpinner} spin />;
  };

  return (
    <>
      <h2>Command-Line Flags</h2>
      {body(error, flags)}
    </>
  );
};

export default Flags;
