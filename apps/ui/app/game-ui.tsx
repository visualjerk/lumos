'use client'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { Investigator } from '@lumos/game'
import React from 'react'
import { useGame } from './use-game'
import { SkillCheckResult } from './skill-check-result'

const investigator: Investigator = {
  id: 'isabel-brimble',
  name: 'Isabel Brimble',
  baseSkills: {
    intelligence: 4,
    strength: 2,
    agility: 3,
  },
  health: 8,
}

export default function GameUI() {
  const { investigators, locations, phase } = useGame(
    MisteryOfTheHogwartsExpress,
    [investigator]
  )

  return (
    <div className="flex flex-col">
      <div className="text-2xl ">Phase: {phase.type}</div>
      {phase.type === 'commitInvestigationSkillCheck' && (
        <div className="inset-0 fixed bg-gray-200 bg-opacity-50 grid place-content-center">
          <div className="bg-white p-4">
            <SkillCheckResult phase={phase} />
          </div>
        </div>
      )}
      <div className="flex flex-row">
        {investigators.map((investigator) => (
          <div key={investigator.id}>
            <div className="text-purple-500">{investigator.name}</div>
            <div>Clues: {investigator.clues}</div>
            <div>Intelligence: {investigator.baseSkills.intelligence}</div>
            <div className="flex flex-row gap-3">
              {investigator.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.execute()}
                  className="p-1 bg-gray-200"
                >
                  {action.type}
                </button>
              ))}
            </div>
          </div>
        ))}
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
                Clues {location.clues} Shroud {location.shroud}
              </div>
            )}
            {location.investigators.map((investigator) => (
              <div key={investigator.id} className=" text-purple-500">
                {investigator.name}
              </div>
            ))}
            {location.actions.map((action, index) => (
              <button key={index} onClick={() => action.execute()}>
                {action.type}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
