'use client'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { INVESTIGATOR_ACTIONS_PER_TURN, Investigator } from '@lumos/game'
import React from 'react'
import { useGame } from './use-game'
import SkillCheckResult from './skill-check-result'
import InvestigatorArea from './investigator-area'
import ActionButton from './action-button'
import EncounterOverlay from './encounter-overlay'
import SkillCheckOverlay from './skill-check-overlay'
import LocationEnemy from './location-enemy'

const investigator: Investigator = {
  id: 'isabel-brimble',
  name: 'Isabel Brimble',
  baseSkills: {
    intelligence: 4,
    strength: 2,
    agility: 3,
  },
  health: 8,
  baseDeck: [
    'ic1',
    'ic1',
    'ic2',
    'ic2',
    'ic3',
    'ic4',
    'ic4',
    'ic5',
    'ic5',
    'ic6',
    'ic6',
  ],
}

export default function GameUI() {
  const { investigators, locations, phase, doom, scene } = useGame(
    MisteryOfTheHogwartsExpress,
    [investigator]
  )

  // TODO: Support more investigators
  const currentInvestigator = investigators[0]

  return (
    <div className="max-w-screen-lg">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-2xl ">Phase: {phase.type}</div>
          {phase.type === 'investigator' && (
            <div>
              Actions: {phase.investigatorContext.actionsMade} /{' '}
              {INVESTIGATOR_ACTIONS_PER_TURN}
            </div>
          )}
          {phase.type === 'skillCheck' && (
            <div className="inset-0 fixed bg-gray-200 bg-opacity-50 grid place-content-center">
              <div className="bg-white p-4">
                <SkillCheckOverlay
                  phase={phase}
                  investigator={currentInvestigator}
                />
              </div>
            </div>
          )}
          {phase.type === 'commitSkillCheck' && (
            <div className="inset-0 fixed bg-gray-200 bg-opacity-50 grid place-content-center">
              <div className="bg-white p-4">
                <SkillCheckResult phase={phase} />
              </div>
            </div>
          )}
          {phase.type === 'handleEncounter' && (
            <div className="inset-0 fixed bg-gray-200 bg-opacity-50 grid place-content-center">
              <div className="bg-white p-4">
                <EncounterOverlay phase={phase} />
              </div>
            </div>
          )}
          {investigators.map((investigator) => (
            <InvestigatorArea
              key={investigator.id}
              phase={phase}
              investigator={investigator}
            />
          ))}
        </div>
        <div className="grid gap-2 bg-gray-300 p-3">
          <div className="text-lg">{doom.name}</div>
          {phase.type === 'advanceDoom' || phase.type === 'endGame' ? (
            <div>🔥 {doom.consequence}</div>
          ) : (
            <div>{doom.story}</div>
          )}
          <div>
            ☠️ {doom.doom} / {doom.treshold}
          </div>
        </div>
        <div className="grid gap-2 bg-gray-300 p-3">
          <div className="text-lg">{scene.name}</div>
          {phase.type === 'advanceScene' || phase.type === 'winGame' ? (
            <div>🥳 {scene.consequence}</div>
          ) : (
            <div>{scene.story}</div>
          )}
          <div>🔮 {scene.clueTreshold}</div>
        </div>
      </div>
      <div className="grid grid-cols-11 grid-rows-11 gap-10">
        {locations.map((location) => (
          <div
            key={location.id}
            className={
              'h-40 bg-gray-200 p-2 ' +
              (location.revealed === true ? 'bg-gray-200' : 'bg-gray-400')
            }
            style={{
              gridColumn: `${location.position[0]} / span 2`,
              gridRow: `${location.position[1]} / span 2`,
            }}
          >
            <div>{location.name}</div>
            {location.revealed === true && (
              <div>
                🔮 {location.clues} Shroud {location.shroud}
              </div>
            )}
            {location.investigators.map((investigator) => (
              <div key={investigator.id} className=" text-purple-500">
                {investigator.name}
              </div>
            ))}
            {location.enemies.map((enemy, index) => (
              <LocationEnemy key={index} enemy={enemy} />
            ))}
            {location.actions.map((action, index) => (
              <ActionButton key={index} onClick={() => action.execute()}>
                {action.type}
              </ActionButton>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
