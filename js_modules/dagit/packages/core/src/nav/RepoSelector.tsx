import {
  Box,
  Checkbox,
  Colors,
  Icon,
  IconWrapper,
  Spinner,
  Table,
  Caption,
  Tooltip,
} from '@dagster-io/ui';
import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components/macro';

import {usePermissionsDEPRECATED} from '../app/Permissions';
import {buildRepoAddress} from '../workspace/buildRepoAddress';
import {repoAddressAsHumanString} from '../workspace/repoAddressAsString';
import {RepoAddress} from '../workspace/types';
import {workspacePathFromAddress} from '../workspace/workspacePath';

import {ReloadRepositoryLocationButton} from './ReloadRepositoryLocationButton';

export interface RepoSelectorOption {
  repositoryLocation: {name: string};
  repository: {
    name: string;
    displayMetadata: {
      key: string;
      value: string;
    }[];
  };
}

interface Props {
  onBrowse: () => void;
  onToggle: (repoAddresses: RepoAddress[]) => void;
  options: RepoSelectorOption[];
  selected: RepoSelectorOption[];
}

export const RepoSelector: React.FC<Props> = (props) => {
  const {onBrowse, onToggle, options, selected} = props;
  const {canReloadRepositoryLocation} = usePermissionsDEPRECATED();

  const optionCount = options.length;
  const selectedCount = selected.length;

  const onToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {checked} = e.target;
    const reposToToggle = options
      .filter((option) => (checked ? !selected.includes(option) : selected.includes(option)))
      .map((option) => buildRepoAddress(option.repository.name, option.repositoryLocation.name));
    onToggle(reposToToggle);
  };

  return (
    <div>
      <Box padding={{vertical: 8, horizontal: 24}} flex={{alignItems: 'center', gap: 12}}>
        <Checkbox
          checked={selectedCount > 0}
          indeterminate={!!(selectedCount && optionCount !== selectedCount)}
          onChange={onToggleAll}
        />
        {`${selected.length} of ${options.length} selected`}
      </Box>
      <Table $monospaceFont={false}>
        <tbody>
          {options.map((option) => {
            const checked = selected.includes(option);
            const repoAddress = {
              location: option.repositoryLocation.name,
              name: option.repository.name,
            };
            const addressString = repoAddressAsHumanString(repoAddress);
            return (
              <tr key={addressString}>
                <td>
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      if (e.target instanceof HTMLInputElement) {
                        onToggle([repoAddress]);
                      }
                    }}
                    id={`switch-${addressString}`}
                  />
                </td>
                <td>
                  <RepoLabel htmlFor={`switch-${addressString}`}>
                    <Box flex={{direction: 'column', gap: 4}}>
                      <RepoLocation>{addressString}</RepoLocation>
                      <Box flex={{direction: 'column', gap: 2}}>
                        {option.repository.displayMetadata.map(({key, value}) => (
                          <Caption
                            style={{color: Colors.Gray400}}
                            key={key}
                          >{`${key}: ${value}`}</Caption>
                        ))}
                      </Box>
                    </Box>
                  </RepoLabel>
                </td>
                <td>
                  <Link to={workspacePathFromAddress(repoAddress)} onClick={() => onBrowse()}>
                    Browse
                  </Link>
                </td>
                {canReloadRepositoryLocation.enabled ? (
                  <td>
                    <ReloadButton repoAddress={repoAddress} />
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const RepoLabel = styled.label`
  cursor: pointer;
  display: block;
  font-weight: 500;
  overflow: hidden;
  position: relative;
  top: 1px;
  transition: filter 50ms linear;
  user-select: none;
  white-space: nowrap;

  :focus,
  :active {
    outline: none;
  }

  :hover {
    filter: opacity(0.8);
  }
`;

const RepoLocation = styled.div`
  color: ${Colors.Gray700};
`;

const ReloadButton: React.FC<{repoAddress: RepoAddress}> = ({repoAddress}) => {
  return (
    <ReloadRepositoryLocationButton location={repoAddress.location}>
      {({tryReload, reloading}) => (
        <Tooltip
          placement="right"
          content={
            reloading ? (
              'Reloading…'
            ) : (
              <>
                Reload <strong>{repoAddress.location}</strong>
              </>
            )
          }
        >
          <ReloadButtonInner onClick={tryReload}>
            {reloading ? (
              <Spinner purpose="body-text" />
            ) : (
              <Icon name="refresh" color={Colors.Gray200} />
            )}
          </ReloadButtonInner>
        </Tooltip>
      )}
    </ReloadRepositoryLocationButton>
  );
};

const ReloadButtonInner = styled.button`
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 8px;
  margin: -6px;
  outline: none;

  ${IconWrapper} {
    background-color: ${Colors.Gray600};
    transition: background-color 100ms;
  }

  :hover ${IconWrapper} {
    background-color: ${Colors.Gray800};
  }

  :focus ${IconWrapper} {
    background-color: ${Colors.Link};
  }
`;
