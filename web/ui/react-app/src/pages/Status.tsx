import React, { FC, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Table, Alert } from 'reactstrap';
import { useFetch } from '../utils/useFetch';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PathPrefixProps from '../PathPrefixProps';

const sectionTitles = ['Runtime Information', 'Build Information', 'Alertmanagers'];

interface StatusConfig {
  [k: string]: { title?: string; customizeValue?: (v: any) => any; customRow?: boolean; skip?: boolean };
}

type StatusPageState = Array<{ [k: string]: string }>;

export const statusConfig: StatusConfig = {
  startTime: { title: 'Start time', customizeValue: (v: string) => new Date(v).toUTCString() },
  CWD: { title: 'Working directory' },
  reloadConfigSuccess: {
    title: 'Configuration reload',
    customizeValue: (v: boolean) => (v ? 'Successful' : 'Unsuccessful'),
  },
  lastConfigTime: { title: 'Last successful configuration reload' },
  chunkCount: { title: 'Head chunks' },
  timeSeriesCount: { title: 'Head time series' },
  corruptionCount: { title: 'WAL corruptions' },
  goroutineCount: { title: 'Goroutines' },
  storageRetention: { title: 'Storage retention' },
  activeAlertmanagers: {
    customRow: true,
    customizeValue: (alertMgrs: { url: string }[]) => {
      return (
        <Fragment key="alert-managers">
          <tr>
            <th>Endpoint</th>
          </tr>
          {alertMgrs.map(({ url }) => {
            const { origin, pathname } = new URL(url);
            return (
              <tr key={url}>
                <td>
                  <a href={url}>{origin}</a>
                  {pathname}
                </td>
              </tr>
            );
          })}
        </Fragment>
      );
    },
  },
  droppedAlertmanagers: { skip: true },
};

const Status: FC<RouteComponentProps & PathPrefixProps> = ({ pathPrefix = '' }) => {
  const {response: runtimeRes, error: runtimeError} = useFetch(`${pathPrefix}/api/v1/status/runtimeinfo`);
  const {response: buildRes, error: buildError} = useFetch(`${pathPrefix}/api/v1/status/buildinfo`);
  const {response: alertmanagersRes, error: alertmanagersError} = useFetch(`${pathPrefix}/api/v1/alertmanagers`);

  const error = runtimeError || buildError || alertmanagersError;
  if (error) {
    return (
      <Alert color="danger">
        <strong>Error:</strong> Error fetching status: {error.message}
      </Alert>
    );
  } 
  
  const isLoading = !runtimeRes || !buildRes || !alertmanagersRes;
  if (isLoading) {
    return (
      <FontAwesomeIcon
        size="3x"
        icon={faSpinner}
        spin
        className="position-absolute"
        style={{ transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }}
      />
    );
  }
  return (
    <>
      {[runtimeRes.data, buildRes.data, alertmanagersRes.data].map((statuses, i) => {
        return (
          <Fragment key={i}>
            <h2>{sectionTitles[i]}</h2>
            <Table className="h-auto" size="sm" bordered striped>
              <tbody>
                {Object.entries(statuses).map(([k, v]) => {
                  const { title = k, customizeValue = (val: any) => val, customRow, skip } = statusConfig[k] || {};
                  if (skip) {
                    return null;
                  }
                  if (customRow) {
                    return customizeValue(v);
                  }
                  return (
                    <tr key={k}>
                      <th className="capitalize-title" style={{ width: '35%' }}>
                        {title}
                      </th>
                      <td className="text-break">{customizeValue(v)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Fragment>
        );
      })}
    </>
  );
};

export default Status;
